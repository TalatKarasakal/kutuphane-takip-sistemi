#!/bin/bash
#
# Uygulamayı bu Mac'in /Applications klasörüne kurar.
#
# Paketin içindeki adlar ASCII olmak zorunda (bkz. electron/afterPack.cjs),
# ama klasör adı serbest; bu yüzden kurulum "Kütüphanem.app" adıyla yapılır.
#
# Kullanım:  ./scripts/install-mac.sh
#
set -euo pipefail

cd "$(dirname "$0")/.."

ARCH="$(uname -m)"
OUT="release/mac-$([ "$ARCH" = "arm64" ] && echo arm64 || echo x64)"
TARGET="/Applications/Kütüphanem.app"

echo "› Paket üretiliyor ($ARCH)…"
npm run build
rm -rf "$OUT"
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dir \
  "--$([ "$ARCH" = "arm64" ] && echo arm64 || echo x64)" --publish never >/dev/null

SRC="$(find "$OUT" -maxdepth 1 -name "*.app" -print -quit)"
[ -n "$SRC" ] || { echo "Paket bulunamadı: $OUT"; exit 1; }

echo "› Çalışan sürüm kapatılıyor…"
pkill -f "/Applications/K.*phanem.app/Contents/MacOS/" 2>/dev/null || true
sleep 1

echo "› Kuruluyor: $TARGET"
rm -rf "$TARGET"
ditto "$SRC" "$TARGET"
# Yerel kurulumda Gatekeeper uyarısı çıkmasın.
xattr -dr com.apple.quarantine "$TARGET" 2>/dev/null || true
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$TARGET" 2>/dev/null || true

codesign --verify --deep --strict "$TARGET"
echo "✓ Kuruldu. Uygulamalar klasöründe 'Kütüphanem' olarak görünür."
