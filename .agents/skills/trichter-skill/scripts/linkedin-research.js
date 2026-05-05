/**
 * linkedin-research.js — v2.0
 *
 * Research de LinkedIn para el skill trichter-content-research.
 * Lee (NO interactúa con) posts recientes de las cuentas en context/references.md.
 *
 * USO:
 *   node scripts/linkedin-research.js "<tema>" [opciones]
 *
 * OPCIONES:
 *   --accounts=N          Cuentas a procesar (default: 8, max: 12)
 *   --posts-per-account=N Posts por cuenta (default: 5)
 *   --verify              Modo verificación: corre contra 1 cuenta, ignora cooldown
 *   --force               Ignora cooldown (usar solo en pruebas)
 *
 * EJEMPLOS:
 *   node scripts/linkedin-research.js "speed to lead" --verify
 *   node scripts/linkedin-research.js "CAC inmobiliario" --accounts=8
 *
 * SETUP INICIAL:
 *   1. cd scripts && npm install
 *   2. npx playwright install chromium
 *   3. cp .env.example .env
 *   4. Pegar valor de cookie li_at en .env (ver instrucciones en .env.example)
 *   5. node linkedin-research.js "test" --verify
 *
 * ⚠️ RESGUARDOS CRÍTICOS:
 *   - Solo lectura. Nunca dar like, comentar, conectar, seguir ni interactuar.
 *   - Cooldown de 4h entre corridas.
 *   - Max 12 cuentas por corrida.
 *   - Si aparece checkpoint/captcha → abortar, esperar 24-48h.
 *   - Usar cuenta secundaria de LinkedIn, NO la principal.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────

const SESSION_DIR    = path.join(__dirname, '.linkedin-session');
const COOLDOWN_FILE  = path.join(__dirname, '.last-run.json');
const COOLDOWN_HOURS = 4;
const MAX_ACCOUNTS   = 12;

const PAUSE          = { min: 3000,  max: 7000  };
const PAUSE_ACCOUNT  = { min: 30000, max: 60000 };
const SCROLL_STEPS   = 4;

// ─────────────────────────────────────────────
// ARGS
// ─────────────────────────────────────────────

const args          = process.argv.slice(2);
const tema          = args[0];
const VERIFY_MODE   = args.includes('--verify');
const FORCE         = args.includes('--force');
const numAccounts   = parseInt((args.find(a => a.startsWith('--accounts='))          || '=8').split('=')[1]);
const postsPerAcct  = parseInt((args.find(a => a.startsWith('--posts-per-account=')) || '=5').split('=')[1]);

if (!tema) {
  console.error('❌ Falta el tema. Uso: node linkedin-research.js "<tema>"');
  process.exit(1);
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pause = (cfg = PAUSE) => sleep(rand(cfg.min, cfg.max));

function log(msg)  { console.log(`[${new Date().toISOString().slice(11,19)}] ${msg}`); }
function warn(msg) { console.warn(`[${new Date().toISOString().slice(11,19)}] ⚠️  ${msg}`); }
function err(msg)  { console.error(`[${new Date().toISOString().slice(11,19)}] ❌ ${msg}`); }

// ─────────────────────────────────────────────
// COOLDOWN
// ─────────────────────────────────────────────

function checkCooldown() {
  if (VERIFY_MODE || FORCE) return true;
  if (!fs.existsSync(COOLDOWN_FILE)) return true;
  const { timestamp } = JSON.parse(fs.readFileSync(COOLDOWN_FILE, 'utf-8'));
  const hoursAgo = (Date.now() - timestamp) / 3_600_000;
  if (hoursAgo < COOLDOWN_HOURS) {
    const remaining = (COOLDOWN_HOURS - hoursAgo).toFixed(1);
    err(`Cooldown activo. Faltan ${remaining}h. Usar --force para saltear (solo en pruebas).`);
    return false;
  }
  return true;
}

function saveCooldown() {
  if (!VERIFY_MODE) fs.writeFileSync(COOLDOWN_FILE, JSON.stringify({ timestamp: Date.now() }));
}

// ─────────────────────────────────────────────
// CUENTAS DESDE references.md
// ─────────────────────────────────────────────

function loadAccounts() {
  const refPath = path.join(__dirname, '..', 'context', 'references.md');
  const content = fs.readFileSync(refPath, 'utf-8');
  const regex   = /https:\/\/www\.linkedin\.com\/(in|company)\/[a-zA-Z0-9._-]+\/?/g;
  const urls    = [...new Set(content.match(regex) || [])];
  if (!urls.length) {
    err('No se encontraron URLs de LinkedIn en context/references.md');
    process.exit(1);
  }
  return urls.slice(0, VERIFY_MODE ? 1 : Math.min(numAccounts, MAX_ACCOUNTS));
}

// ─────────────────────────────────────────────
// STEALTH — parchea fingerprints antes de navegar
// ─────────────────────────────────────────────

const STEALTH_SCRIPT = `
  // Ocultar webdriver
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

  // Chrome runtime simulado
  window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} };

  // Permisos reales
  const origQuery = window.navigator.permissions.query;
  window.navigator.permissions.query = (params) =>
    params.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : origQuery(params);

  // Plugins no vacíos
  Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5].map(i => ({ name: 'Plugin ' + i }))
  });

  // Idioma coherente
  Object.defineProperty(navigator, 'languages', { get: () => ['es-419', 'es', 'en'] });
`;

async function applyStealthAndAuth(page, liAtCookie) {
  await page.addInitScript(STEALTH_SCRIPT);

  if (liAtCookie) {
    await page.context().addCookies([{
      name:     'li_at',
      value:    liAtCookie,
      domain:   '.linkedin.com',
      path:     '/',
      httpOnly: true,
      secure:   true,
    }]);
  }
}

// ─────────────────────────────────────────────
// AUTH — cookie li_at o login manual
// ─────────────────────────────────────────────

async function ensureAuth(page, liAtCookie) {
  log('Verificando autenticación...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await pause();

  if (await detectCheckpoint(page)) throw new Error('CHECKPOINT_DETECTED');

  const isLoggedIn = page.url().includes('/feed') && !page.url().includes('/login');

  if (isLoggedIn) {
    log('✅ Sesión activa.');
    return;
  }

  if (liAtCookie) {
    err('Cookie li_at inválida o expirada. Renovar en scripts/.env');
    err('Instrucciones: F12 → Application → Cookies → www.linkedin.com → li_at');
    process.exit(1);
  }

  // Fallback: login manual
  warn('Sin cookie li_at. Modo login manual activado.');
  warn('Tienes 90 segundos para iniciar sesión en la ventana de Chromium.');
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    await sleep(2000);
    if (page.url().includes('/feed') && !page.url().includes('/login')) {
      log('✅ Login manual completado.');
      await pause({ min: 5000, max: 8000 });
      return;
    }
  }
  throw new Error('Login manual no completado en 90s.');
}

// ─────────────────────────────────────────────
// CHECKPOINT DETECTION
// ─────────────────────────────────────────────

async function detectCheckpoint(page) {
  const url = page.url();
  if (/\/checkpoint|\/captcha|challenge/.test(url)) return true;

  const blockers = [
    'unusual activity', 'verify your identity', 'security verification',
    'actividad inusual', 'verificación de seguridad', "we've noticed",
  ];
  const bodyText = (await page.textContent('body').catch(() => '')).toLowerCase();
  return blockers.some(b => bodyText.includes(b));
}

// ─────────────────────────────────────────────
// SCROLL HUMANIZADO
// ─────────────────────────────────────────────

async function humanScroll(page, steps = SCROLL_STEPS) {
  for (let i = 0; i < steps; i++) {
    const distance = rand(600, 1000);
    await page.evaluate(d => window.scrollBy({ top: d, behavior: 'smooth' }), distance);
    await pause({ min: 1500, max: 3500 });
  }
}

// ─────────────────────────────────────────────
// URL DE POSTS POR TIPO DE CUENTA
// ─────────────────────────────────────────────

function buildPostsUrl(accountUrl) {
  const clean = accountUrl.replace(/\/$/, '');
  if (clean.includes('/in/')) {
    // Perfil personal → recent activity
    const handle = clean.split('/in/')[1].split('/')[0];
    return `https://www.linkedin.com/in/${handle}/recent-activity/all/`;
  }
  if (clean.includes('/company/')) {
    // Página empresa → posts feed
    const handle = clean.split('/company/')[1].split('/')[0];
    return `https://www.linkedin.com/company/${handle}/posts/?feedView=all`;
  }
  return null;
}

// ─────────────────────────────────────────────
// EXTRACCIÓN DE POSTS — multi-estrategia
// ─────────────────────────────────────────────

/**
 * Selectores en 3 capas de fallback.
 * LinkedIn cambia sus clases frecuentemente — este enfoque sobrevive la mayoría de cambios.
 *
 * Capa 1: data-* attributes (más estables)
 * Capa 2: aria roles y labels
 * Capa 3: estructura semántica / texto
 */
async function extractPosts(page, maxPosts) {
  return page.evaluate((max) => {
    const results = [];

    // ── CAPA 1: contenedores por data-urn (LinkedIn usa URNs únicos por post)
    let containers = Array.from(document.querySelectorAll('[data-urn]'))
      .filter(el => {
        const urn = el.getAttribute('data-urn') || '';
        // Solo actividades/updates, no artículos de feed auxiliares
        return urn.includes(':activity:') || urn.includes(':ugcPost:') || urn.includes(':share:');
      });

    // ── CAPA 2: fallback a contenedores por clase semántica conocida
    if (!containers.length) {
      containers = Array.from(document.querySelectorAll(
        'div.feed-shared-update-v2, div.occludable-update, div[class*="update-v2"]'
      ));
    }

    // ── CAPA 3: fallback a artículos con rol feed
    if (!containers.length) {
      containers = Array.from(document.querySelectorAll('article, li[class*="result"]'));
    }

    for (const el of containers.slice(0, max)) {
      // ── TEXTO DEL POST ──────────────────────────────
      let text = '';

      // Estrategia 1: span[dir="ltr"] dentro del post (más robusto)
      const dirLtr = el.querySelector('span[dir="ltr"]');
      if (dirLtr) text = dirLtr.innerText.trim();

      // Estrategia 2: div con clases de descripción conocidas
      if (!text) {
        const descEl = el.querySelector(
          '.feed-shared-update-v2__description, .update-components-text, [class*="commentary"]'
        );
        if (descEl) text = descEl.innerText.trim();
      }

      // Estrategia 3: primer p o div con contenido de texto sustancial
      if (!text) {
        const candidates = Array.from(el.querySelectorAll('p, div'));
        const candidate  = candidates.find(c => c.innerText && c.innerText.trim().length > 50);
        if (candidate) text = candidate.innerText.trim().slice(0, 1500);
      }

      if (!text || text.length < 20) continue;

      // ── REACCIONES ──────────────────────────────────
      let reactions = '0';

      // Estrategia 1: botón aria-label con "reaction"
      const reactionBtn = el.querySelector('button[aria-label*="reaction"], button[aria-label*="reaccion"]');
      if (reactionBtn) {
        const num = reactionBtn.innerText.match(/[\d,.]+/);
        if (num) reactions = num[0];
      }

      // Estrategia 2: span con count de reacciones
      if (reactions === '0') {
        const reactEl = el.querySelector(
          '.social-details-social-counts__reactions-count, [class*="reactions-count"], [class*="reaction-count"]'
        );
        if (reactEl) reactions = reactEl.innerText.trim() || '0';
      }

      // ── FORMATO ─────────────────────────────────────
      const hasCarousel = !!(
        el.querySelector('[class*="document"], [data-view-name*="document"], [class*="carousel"]') ||
        el.querySelector('img[src*="dms/document"]')
      );
      const hasVideo = !!(el.querySelector('video, [class*="video"], [data-view-name*="video"]'));
      const hasImage = !!(el.querySelector('img:not([class*="avatar"]):not([class*="logo"])'));

      const format = hasCarousel ? 'carousel'
                   : hasVideo   ? 'video'
                   : hasImage   ? 'image'
                   :              'text';

      // ── HOOK (primera línea del post) ───────────────
      const hook = text.split(/\n+/)[0].trim().slice(0, 140);

      // ── URN (id único del post) ─────────────────────
      const urn = el.getAttribute('data-urn') || '';

      results.push({ text: text.slice(0, 1500), hook, reactions, format, urn });
    }

    return results;
  }, maxPosts);
}

// ─────────────────────────────────────────────
// SCRAPE DE UNA CUENTA
// ─────────────────────────────────────────────

async function scrapeAccount(page, accountUrl, maxPosts) {
  const postsUrl = buildPostsUrl(accountUrl);
  if (!postsUrl) {
    warn(`URL no reconocida, saltando: ${accountUrl}`);
    return [];
  }

  log(`Procesando: ${accountUrl}`);

  try {
    await page.goto(postsUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await pause();

    if (await detectCheckpoint(page)) throw new Error('CHECKPOINT_DETECTED');

    // Esperar que carguen posts antes de scrollear
    await page.waitForSelector(
      '[data-urn], div.feed-shared-update-v2, div.occludable-update',
      { timeout: 15000 }
    ).catch(() => warn('Selector de posts no encontrado, intentando scroll igual...'));

    await humanScroll(page);

    const posts = await extractPosts(page, maxPosts);

    if (!posts.length) {
      warn(`0 posts extraídos de ${accountUrl} — los selectores pueden necesitar ajuste.`);
      warn('Correr con --verify para inspeccionar el DOM manualmente.');
    } else {
      log(`✅ ${posts.length} posts extraídos.`);
    }

    return posts.map(p => ({ ...p, source: accountUrl }));

  } catch (e) {
    if (e.message === 'CHECKPOINT_DETECTED') throw e;
    warn(`Error procesando ${accountUrl}: ${e.message}`);
    return [];
  }
}

// ─────────────────────────────────────────────
// MODO VERIFY — diagnóstico de selectores
// ─────────────────────────────────────────────

async function runVerify(page, account) {
  const postsUrl = buildPostsUrl(account);
  log(`VERIFY MODE — URL destino: ${postsUrl}`);

  await page.goto(postsUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await pause();

  if (await detectCheckpoint(page)) {
    err('CHECKPOINT detectado en modo verify. Cambiar cuenta o esperar 24h.');
    return;
  }

  await humanScroll(page, 2);

  // Diagnóstico de selectores
  const diagnosis = await page.evaluate(() => {
    return {
      byDataUrn:     document.querySelectorAll('[data-urn]').length,
      byFeedUpdate:  document.querySelectorAll('div.feed-shared-update-v2').length,
      byOccludable:  document.querySelectorAll('div.occludable-update').length,
      byActivity:    document.querySelectorAll('[data-urn*="activity"]').length,
      byDirLtr:      document.querySelectorAll('span[dir="ltr"]').length,
      pageUrl:       window.location.href,
      title:         document.title.slice(0, 80),
    };
  });

  log('── Diagnóstico de selectores ──────────────────');
  log(`  URL actual:           ${diagnosis.pageUrl}`);
  log(`  Título:               ${diagnosis.title}`);
  log(`  [data-urn]:           ${diagnosis.byDataUrn} elementos`);
  log(`  [data-urn*=activity]: ${diagnosis.byActivity} actividades`);
  log(`  .feed-shared-update:  ${diagnosis.byFeedUpdate} elementos`);
  log(`  .occludable-update:   ${diagnosis.byOccludable} elementos`);
  log(`  span[dir=ltr]:        ${diagnosis.byDirLtr} spans`);
  log('───────────────────────────────────────────────');

  if (diagnosis.byActivity > 0 || diagnosis.byFeedUpdate > 0) {
    log('✅ Selectores operativos. Proceder con corrida completa.');
  } else {
    warn('Selectores no encontraron posts. Acciones posibles:');
    warn('  1. Verificar que la sesión LinkedIn está activa (li_at vigente)');
    warn('  2. Abrir la URL manualmente y revisar el DOM con F12');
    warn('  3. Actualizar selectores en extractPosts() según DOM actual');
  }

  // Muestra 1 post de prueba
  const sample = await extractPosts(page, 1);
  if (sample.length) {
    log('── Post de muestra ────────────────────────────');
    log(`  Formato:   ${sample[0].format}`);
    log(`  Reacciones: ${sample[0].reactions}`);
    log(`  Hook:      ${sample[0].hook}`);
    log(`  URN:       ${sample[0].urn}`);
    log('───────────────────────────────────────────────');
  }
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  if (!checkCooldown()) process.exit(2);

  const liAtCookie = process.env.LI_AT || null;
  if (!liAtCookie && !VERIFY_MODE) {
    warn('No se encontró LI_AT en scripts/.env');
    warn('Se usará login manual. Para evitar esto: cp scripts/.env.example scripts/.env y pegar li_at');
  }

  const accounts = loadAccounts();
  log(`Tema:     "${tema}"`);
  log(`Modo:     ${VERIFY_MODE ? 'VERIFY (1 cuenta, sin cooldown)' : 'PRODUCCIÓN'}`);
  log(`Cuentas:  ${accounts.length}`);
  log(`Posts/c:  ${postsPerAcct}`);

  // Crear directorio de sesión
  fs.mkdirSync(SESSION_DIR, { recursive: true });

  const browser = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'es-419',
    timezoneId: 'America/Mexico_City',
  });

  const page = await browser.newPage();
  await applyStealthAndAuth(page, liAtCookie);

  try {
    await ensureAuth(page, liAtCookie);

    // ── MODO VERIFY ──────────────────────────────
    if (VERIFY_MODE) {
      await runVerify(page, accounts[0]);
      await browser.close();
      return;
    }

    // ── MODO PRODUCCIÓN ──────────────────────────
    const allPosts = [];

    for (let i = 0; i < accounts.length; i++) {
      if (i > 0) {
        const secs = rand(PAUSE_ACCOUNT.min, PAUSE_ACCOUNT.max) / 1000;
        log(`Pausa de ${Math.round(secs)}s antes de la siguiente cuenta...`);
        await pause(PAUSE_ACCOUNT);
      }

      try {
        const posts = await scrapeAccount(page, accounts[i], postsPerAcct);
        allPosts.push(...posts);
      } catch (e) {
        if (e.message === 'CHECKPOINT_DETECTED') {
          err('LinkedIn detectó actividad automatizada. ABORTANDO.');
          err('Recomendación: esperar 24-48h antes de reintentar.');
          break;
        }
        throw e;
      }
    }

    // ── GUARDAR OUTPUT ───────────────────────────
    const today     = new Date().toISOString().slice(0, 10);
    const outputDir = path.join(__dirname, '..', 'outputs', today);
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'raw-linkedin.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      tema,
      timestamp:          new Date().toISOString(),
      accounts_processed: accounts.length,
      total_posts:        allPosts.length,
      posts:              allPosts,
    }, null, 2));

    log(`✅ Research completo.`);
    log(`   Output: ${outputPath}`);
    log(`   Posts:  ${allPosts.length}`);

    saveCooldown();

  } catch (e) {
    err(`Error fatal: ${e.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
