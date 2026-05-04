/**
 * linkedin-research.js
 *
 * Script de research en LinkedIn para el skill trichter-content-research.
 * Usa Playwright con sesión persistente para leer (NO interactuar con) posts
 * recientes de las cuentas declaradas en context/references.md.
 *
 * USO:
 *   node scripts/linkedin-research.js "<tema>" [--accounts=N] [--posts-per-account=N]
 *
 * EJEMPLO:
 *   node scripts/linkedin-research.js "speed to lead inmobiliario" --accounts=8 --posts-per-account=5
 *
 * REQUISITOS:
 *   - npm install playwright
 *   - npx playwright install chromium
 *
 * ⚠️ RESGUARDOS CRÍTICOS:
 *   - Solo lectura. Nunca dar like, comentar, conectar, o interactuar.
 *   - Pausas humanas entre acciones (3-7s) y entre cuentas (30-60s).
 *   - Máximo 12 cuentas por corrida.
 *   - Cooldown de 4 horas entre corridas (verifica timestamp).
 *   - Si LinkedIn muestra checkpoint/captcha → abortar inmediatamente.
 *   - Recomendado usar cuenta de LinkedIn dedicada a research, NO la principal.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURACIÓN
// ============================================================

const SESSION_DIR = path.join(__dirname, '.linkedin-session');
const COOLDOWN_FILE = path.join(__dirname, '.last-run.json');
const COOLDOWN_HOURS = 4;
const MAX_ACCOUNTS = 12;

// Pausas humanas (en milisegundos)
const PAUSE_MIN = 3000;
const PAUSE_MAX = 7000;
const PAUSE_BETWEEN_ACCOUNTS_MIN = 30000;
const PAUSE_BETWEEN_ACCOUNTS_MAX = 60000;

// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomPause(min = PAUSE_MIN, max = PAUSE_MAX) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return sleep(ms);
}

function checkCooldown() {
  if (!fs.existsSync(COOLDOWN_FILE)) return true;
  const last = JSON.parse(fs.readFileSync(COOLDOWN_FILE, 'utf-8'));
  const hoursSince = (Date.now() - last.timestamp) / (1000 * 60 * 60);
  if (hoursSince < COOLDOWN_HOURS) {
    console.error(
      `❌ Cooldown activo. Última corrida hace ${hoursSince.toFixed(1)}h. ` +
      `Esperá ${(COOLDOWN_HOURS - hoursSince).toFixed(1)}h más o borrá ${COOLDOWN_FILE}.`
    );
    return false;
  }
  return true;
}

function updateCooldown() {
  fs.writeFileSync(COOLDOWN_FILE, JSON.stringify({ timestamp: Date.now() }));
}

function loadAccountsFromReferences() {
  // Lee context/references.md y extrae las URLs de LinkedIn
  const refPath = path.join(__dirname, '..', 'context', 'references.md');
  const content = fs.readFileSync(refPath, 'utf-8');
  const urlRegex = /https:\/\/www\.linkedin\.com\/(in|company)\/[a-zA-Z0-9-_]+\/?/g;
  const matches = [...new Set(content.match(urlRegex) || [])];
  return matches.slice(0, MAX_ACCOUNTS);
}

// ============================================================
// DETECCIÓN DE CHECKPOINT / CAPTCHA
// ============================================================

async function detectCheckpoint(page) {
  const url = page.url();
  if (url.includes('/checkpoint') || url.includes('/captcha') || url.includes('/uas/login')) {
    return true;
  }
  // Buscar texto típico de bloqueo
  const blockedTexts = [
    'unusual activity',
    'verify your identity',
    'security verification',
    'actividad inusual',
    'verificación de seguridad'
  ];
  for (const text of blockedTexts) {
    if (await page.locator(`text=${text}`).count() > 0) return true;
  }
  return false;
}

// ============================================================
// LOGIN MANUAL (primera vez)
// ============================================================

async function ensureLogin(page) {
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await randomPause();

  // Si redirige a login, pedir intervención manual
  if (page.url().includes('/login') || page.url().includes('/uas/login')) {
    console.log('⚠️  No hay sesión activa. Iniciando sesión manualmente.');
    console.log('   Tenés 90 segundos para loguearte en la ventana de Chromium.');
    console.log('   Una vez logueado, esperá a que aparezca el feed y volvé acá.');

    // Esperar hasta que el usuario llegue al feed (máx 90s)
    const start = Date.now();
    while (Date.now() - start < 90000) {
      await sleep(2000);
      if (page.url().includes('/feed') && !page.url().includes('login')) {
        console.log('✅ Sesión iniciada. Continuando.');
        await randomPause(5000, 8000); // pausa post-login
        return true;
      }
    }
    throw new Error('Login manual no completado en 90s. Abortando.');
  }
  console.log('✅ Sesión activa detectada.');
  return true;
}

// ============================================================
// EXTRACCIÓN DE POSTS
// ============================================================

async function scrapePostsFromAccount(page, accountUrl, postsPerAccount = 5) {
  console.log(`\n🔍 Procesando: ${accountUrl}`);

  // Construir URL del feed/posts del usuario
  // Para personas: /in/USER/recent-activity/all/
  // Para empresas: /company/COMPANY/posts/
  let postsUrl;
  if (accountUrl.includes('/in/')) {
    postsUrl = accountUrl.replace(/\/$/, '') + '/recent-activity/all/';
  } else if (accountUrl.includes('/company/')) {
    postsUrl = accountUrl.replace(/\/$/, '').replace(/\/posts.*$/, '') + '/posts/?feedView=all';
  } else {
    console.warn(`   ⚠️  URL no reconocida, saltando.`);
    return [];
  }

  try {
    await page.goto(postsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomPause();

    if (await detectCheckpoint(page)) {
      throw new Error('CHECKPOINT_DETECTED');
    }

    // Scroll lento para cargar posts
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await randomPause(2000, 4000);
    }

    // ⚠️ STUB DE SELECTORES — LinkedIn cambia sus selectores frecuentemente.
    // En la primera corrida real, ajustar estos selectores inspeccionando el DOM.
    // Selectores aproximados (mayo 2026):
    const posts = await page.evaluate((max) => {
      const articles = Array.from(document.querySelectorAll('div.feed-shared-update-v2'));
      return articles.slice(0, max).map(article => {
        const textEl = article.querySelector('.feed-shared-update-v2__description, .update-components-text');
        const text = textEl ? textEl.innerText.trim() : '';
        const reactionsEl = article.querySelector('.social-details-social-counts__reactions-count');
        const reactions = reactionsEl ? reactionsEl.innerText.trim() : '0';
        const hasCarousel = !!article.querySelector('.update-components-document, .feed-shared-mini-update-v2');
        const hasImage = !!article.querySelector('.feed-shared-image, .update-components-image');
        const hasVideo = !!article.querySelector('.feed-shared-linkedin-video, video');
        return {
          text,
          reactions,
          format: hasCarousel ? 'carousel' : hasVideo ? 'video' : hasImage ? 'image' : 'text',
          hook: text.split('\n')[0].slice(0, 120)
        };
      });
    }, postsPerAccount);

    console.log(`   ✅ ${posts.length} posts extraídos`);
    return posts.map(p => ({ ...p, source: accountUrl }));

  } catch (err) {
    if (err.message === 'CHECKPOINT_DETECTED') throw err;
    console.warn(`   ⚠️  Error procesando cuenta: ${err.message}`);
    return [];
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  // Parse args
  const args = process.argv.slice(2);
  const tema = args[0];
  if (!tema) {
    console.error('❌ Falta el tema. Uso: node linkedin-research.js "<tema>"');
    process.exit(1);
  }
  const accountsArg = args.find(a => a.startsWith('--accounts='));
  const postsArg = args.find(a => a.startsWith('--posts-per-account='));
  const numAccounts = accountsArg ? parseInt(accountsArg.split('=')[1]) : 8;
  const postsPerAccount = postsArg ? parseInt(postsArg.split('=')[1]) : 5;

  // Cooldown
  if (!checkCooldown()) process.exit(2);

  // Cargar cuentas
  const allAccounts = loadAccountsFromReferences();
  const accounts = allAccounts.slice(0, Math.min(numAccounts, MAX_ACCOUNTS));
  console.log(`📋 Tema: "${tema}"`);
  console.log(`📋 Cuentas a procesar: ${accounts.length}`);

  // Output dir
  const today = new Date().toISOString().slice(0, 10);
  const outputDir = path.join(__dirname, '..', 'outputs', today);
  fs.mkdirSync(outputDir, { recursive: true });

  // Browser con sesión persistente
  const browser = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await browser.newPage();

  try {
    await ensureLogin(page);

    const allResults = [];

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];

      // Pausa entre cuentas (excepto la primera)
      if (i > 0) {
        const pauseSeconds = Math.floor(
          (Math.random() * (PAUSE_BETWEEN_ACCOUNTS_MAX - PAUSE_BETWEEN_ACCOUNTS_MIN) + PAUSE_BETWEEN_ACCOUNTS_MIN) / 1000
        );
        console.log(`   ⏸  Pausa de ${pauseSeconds}s antes de la próxima cuenta...`);
        await randomPause(PAUSE_BETWEEN_ACCOUNTS_MIN, PAUSE_BETWEEN_ACCOUNTS_MAX);
      }

      try {
        const posts = await scrapePostsFromAccount(page, account, postsPerAccount);
        allResults.push(...posts);
      } catch (err) {
        if (err.message === 'CHECKPOINT_DETECTED') {
          console.error('\n🚨 LinkedIn detectó actividad inusual. ABORTANDO inmediatamente.');
          console.error('   Recomendación: esperar 24-48h antes de reintentar.');
          break;
        }
        throw err;
      }
    }

    // Guardar raw output
    const outputPath = path.join(outputDir, 'raw-linkedin.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      tema,
      timestamp: new Date().toISOString(),
      accounts_processed: accounts.length,
      total_posts: allResults.length,
      posts: allResults
    }, null, 2));

    console.log(`\n✅ Research completo. Output en: ${outputPath}`);
    console.log(`   Total posts: ${allResults.length}`);

    updateCooldown();

  } catch (err) {
    console.error(`\n❌ Error fatal: ${err.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
