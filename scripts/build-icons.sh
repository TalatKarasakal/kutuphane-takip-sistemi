#!/bin/bash
#
# Uygulama simgelerini yeniden üretir.
#
# Kaynak: build/appicon.icon (Icon Composer belgesi). İçindeki
# Assets/Logo.png saydam zeminli logodur; icon.json ise zemin rengini
# tutar. Belge Icon Composer ile açılıp düzenlenebilir.
#
# Bu betik yalnızca çizim değiştiğinde çalıştırılır; ürettiği dosyalar
# depoya işlenir. Uygulamayı derlemek için gerekmez.
#
# Gereksinimler: macOS 26+, Xcode (actool), python3 + Pillow.
#
# Üretilenler:
#   build/icon.png       1024×1024 koyu zeminli ana simge
#   build/icon.icns      macOS simge paketi (koyu)
#   build/icon.ico       Windows simgesi (koyu)
#   build/icon-dark.png  Dock için koyu görünüm
#   build/icon-light.png Dock için açık görünüm
#
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
SRC="$ROOT/build/appicon.icon"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

command -v xcrun >/dev/null || { echo "Xcode komut satırı araçları gerekli."; exit 1; }
python3 -c "import PIL" 2>/dev/null || { echo "python3 + Pillow gerekli (pip install Pillow)."; exit 1; }

# macOS'un simgeyi nasıl çizdiğini birebir almak için, her görünüm için
# ayrı bir .icon derleyip IconServices'e çizdiriyoruz. Böylece kare/köşe
# yuvarlaklığı, kenar boşluğu ve gölge Apple'ın kendi ızgarasıyla aynı olur.
cat > "$WORK/render.swift" <<'SWIFT'
import AppKit
let appPath = CommandLine.arguments[1]
let outPath = CommandLine.arguments[2]
let size = 1024.0
NSApplication.shared.setActivationPolicy(.prohibited)
let appearance = NSAppearance(named: .aqua)!
var icon = NSImage()
appearance.performAsCurrentDrawingAppearance { icon = NSWorkspace.shared.icon(forFile: appPath) }
icon.size = NSSize(width: size, height: size)
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size), pixelsHigh: Int(size),
                           bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                           colorSpaceName: .calibratedRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)!
appearance.performAsCurrentDrawingAppearance {
  icon.draw(in: NSRect(x: 0, y: 0, width: size, height: size))
}
NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: outPath))
SWIFT
xcrun swiftc -O "$WORK/render.swift" -o "$WORK/render"

# $1: görünüm adı, $2: zemin rengi
render_variant() {
  local name="$1" fill="$2"
  local doc="$WORK/$name.icon" out="$WORK/out-$name" app="$WORK/$name.app"
  rm -rf "$doc" "$out" "$app"
  mkdir -p "$doc/Assets" "$out" "$app/Contents/MacOS" "$app/Contents/Resources"
  cp "$SRC/Assets/Logo.png" "$doc/Assets/Logo.png"
  python3 - "$SRC/icon.json" "$doc/icon.json" "$fill" <<'PY'
import json, sys
doc = json.load(open(sys.argv[1]))
doc["fill"] = {"solid": sys.argv[3]}
json.dump(doc, open(sys.argv[2], "w"), indent=2)
PY
  xcrun actool --compile "$out" --platform macosx --minimum-deployment-target 26.0 \
    --app-icon "$name" --output-partial-info-plist "$out/partial.plist" --errors "$doc" >/dev/null

  cp "$out/Assets.car" "$app/Contents/Resources/"
  printf '#!/bin/sh\n' > "$app/Contents/MacOS/stub"
  chmod +x "$app/Contents/MacOS/stub"
  cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>stub</string>
<key>CFBundleIdentifier</key><string>com.talatkarasakal.kutuphanem.iconbuild.$name</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleIconName</key><string>$name</string>
<key>CFBundleName</key><string>$name</string>
<key>LSMinimumSystemVersion</key><string>26.0</string>
</dict></plist>
PLIST
  touch "$app"
  "$WORK/render" "$app" "$WORK/master-$name.png"
}

render_variant dark "extended-srgb:0.00000,0.00000,0.00000,1.00000"
render_variant light "extended-srgb:1.00000,1.00000,1.00000,1.00000"

python3 - "$WORK" "$ROOT/build" <<'PY'
import subprocess, sys
from pathlib import Path
from PIL import Image

work, out = Path(sys.argv[1]), Path(sys.argv[2])
dark = Image.open(work / "master-dark.png").convert("RGBA")
light = Image.open(work / "master-light.png").convert("RGBA")

dark.save(out / "icon.png")
dark.save(out / "icon-dark.png")
light.save(out / "icon-light.png")

iconset = work / "icon.iconset"
iconset.mkdir(exist_ok=True)
for base in (16, 32, 128, 256, 512):
    dark.resize((base, base), Image.LANCZOS).save(iconset / f"icon_{base}x{base}.png")
    dark.resize((base * 2, base * 2), Image.LANCZOS).save(iconset / f"icon_{base}x{base}@2x.png")
subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(out / "icon.icns")], check=True)

dark.save(out / "icon.ico", sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
print("Simgeler üretildi:", ", ".join(sorted(p.name for p in out.iterdir())))
PY
