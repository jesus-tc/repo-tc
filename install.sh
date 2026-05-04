#!/usr/bin/env bash
set -euo pipefail

PACKAGE_NAME="repo-tc"
INSTALL_DIR="/usr/local/bin"
REPO="jesus-tc/repo-tc"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()    { echo -e "${GREEN}[info]${NC} $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $*"; }
error()   { echo -e "${RED}[error]${NC} $*" >&2; exit 1; }

detect_os() {
  case "$(uname -s)" in
    Linux*)  echo "linux" ;;
    Darwin*) echo "macos" ;;
    *)       error "Unsupported OS: $(uname -s)" ;;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64) echo "x86_64" ;;
    arm64|aarch64) echo "arm64" ;;
    *) error "Unsupported architecture: $(uname -m)" ;;
  esac
}

check_deps() {
  for cmd in curl tar; do
    command -v "$cmd" >/dev/null 2>&1 || error "Required dependency not found: $cmd"
  done
}

get_latest_version() {
  curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
    | grep '"tag_name"' \
    | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/'
}

install_binary() {
  local os="$1"
  local arch="$2"
  local version="$3"
  local tmpdir
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT

  local filename="${PACKAGE_NAME}-${version}-${os}-${arch}.tar.gz"
  local url="https://github.com/${REPO}/releases/download/${version}/${filename}"

  info "Downloading ${filename}..."
  curl -fsSL "$url" -o "${tmpdir}/${filename}" \
    || error "Failed to download release from ${url}"

  info "Extracting..."
  tar -xzf "${tmpdir}/${filename}" -C "$tmpdir"

  local binary="${tmpdir}/${PACKAGE_NAME}"
  [[ -f "$binary" ]] || error "Binary not found in archive"

  chmod +x "$binary"

  if [[ -w "$INSTALL_DIR" ]]; then
    mv "$binary" "${INSTALL_DIR}/${PACKAGE_NAME}"
  else
    info "Requesting sudo to install to ${INSTALL_DIR}..."
    sudo mv "$binary" "${INSTALL_DIR}/${PACKAGE_NAME}"
  fi
}

main() {
  info "Installing ${PACKAGE_NAME}..."

  check_deps

  local os arch version
  os="$(detect_os)"
  arch="$(detect_arch)"

  info "Detected: ${os}/${arch}"

  version="${VERSION:-$(get_latest_version)}"
  [[ -n "$version" ]] || error "Could not determine version to install"

  info "Version: ${version}"

  install_binary "$os" "$arch" "$version"

  info "${PACKAGE_NAME} ${version} installed successfully to ${INSTALL_DIR}/${PACKAGE_NAME}"
}

main "$@"
