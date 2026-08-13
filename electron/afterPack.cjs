const path = require("path");
const fs = require("fs");
const { signAsync } = require("@electron/osx-sign");

const LOCALES = ["en", "tr", "Base"];

/**
 * Paket adı ASCII ("Kutuphanem") olmak zorunda: macOS'ta çalıştırılabilir adı
 * ASCII olmayan bir karakter içerdiğinde uygulama açılışta ölüyor ve Electron
 * yardımcı süreçleri `CFBundleName` üzerinden bulduğu için o da ASCII kalmalı.
 * Kullanıcıya Türkçe adı göstermek için yerelleştirilmiş görünen ad yazılır.
 */
function writeLocalizedName(appPath) {
  for (const locale of LOCALES) {
    const dir = path.join(appPath, "Contents", "Resources", `${locale}.lproj`);
    fs.mkdirSync(dir, { recursive: true });
    // .strings dosyaları BOM'lu UTF-16 bekler; BOM olmadan macOS okuyamıyor.
    fs.writeFileSync(
      path.join(dir, "InfoPlist.strings"),
      '﻿"CFBundleDisplayName" = "Kütüphanem";\n"CFBundleName" = "Kütüphanem";\n',
      "utf16le",
    );
  }
}

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  if (require("os").platform() !== "darwin") return; // codesign is macOS-only
  if (context.appOutDir.endsWith("-temp")) return; // Universal birleştirmeden önce iki mimariyi ayrı imzalama.

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);

  // İmzadan önce yazılmalı; sonradan eklenen dosya imzayı geçersiz kılar.
  writeLocalizedName(appPath);

  if (process.env.CSC_LINK || process.env.CSC_NAME) return; // electron-builder gerçek kimlikle imzalar

  const entitlements = path.join(__dirname, "entitlements.plist");
  console.log(`[afterPack] local ad-hoc signing ${appPath}`);

  await signAsync({
    app: appPath,
    identity: "-",
    identityValidation: false,
    type: "distribution",
    hardenedRuntime: true,
    preAutoEntitlements: false,
    preEmbedProvisioningProfile: false,
    optionsForFile: () => ({ entitlements }),
  });
};
