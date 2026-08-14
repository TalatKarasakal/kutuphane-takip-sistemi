const path = require("path");
const fs = require("fs");
const { signAsync } = require("@electron/osx-sign");

const LOCALES = ["en", "tr", "Base"];

/** Kullanıcının Finder'da göreceği paket adı. */
const DISPLAY_NAME = "Kütüphanem";

/**
 * Paket içindeki adlar ASCII ("Kutuphanem") olmak zorunda: çalıştırılabilir
 * dosya, `CFBundleName` ya da yardımcı süreç paketleri ASCII olmayan bir
 * karakter içerdiğinde uygulama açılışta SIGTRAP ile ölüyor. Paketin klasör
 * adı ise serbest; Türkçe adı oradan ve görünen ad alanlarından veriyoruz.
 */
function writeLocalizedName(appPath) {
  for (const locale of LOCALES) {
    const dir = path.join(appPath, "Contents", "Resources", `${locale}.lproj`);
    fs.mkdirSync(dir, { recursive: true });
    // .strings dosyaları BOM'lu UTF-16 bekler; BOM olmadan macOS okuyamıyor.
    fs.writeFileSync(
      path.join(dir, "InfoPlist.strings"),
      `﻿"CFBundleDisplayName" = "${DISPLAY_NAME}";\n"CFBundleName" = "${DISPLAY_NAME}";\n`,
      "utf16le",
    );
  }
}

/**
 * Paketin klasör adını Türkçeye çevirir. İçerideki ASCII adlara dokunmadığı
 * ve imza yalnız `Contents/` içeriğini kapsadığı için imzayı bozmaz.
 * Dönüş: kullanılacak son .app yolu.
 */
function renameBundle(appPath) {
  const target = path.join(path.dirname(appPath), `${DISPLAY_NAME}.app`);
  if (appPath === target) return appPath;
  fs.rmSync(target, { recursive: true, force: true });
  fs.renameSync(appPath, target);
  return target;
}

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  if (require("os").platform() !== "darwin") return; // codesign is macOS-only
  if (context.appOutDir.endsWith("-temp")) return; // Universal birleştirmeden önce iki mimariyi ayrı imzalama.

  const appName = context.packager.appInfo.productFilename;
  let appPath = path.join(context.appOutDir, `${appName}.app`);

  // İmzadan önce yazılmalı; sonradan eklenen dosya imzayı geçersiz kılar.
  writeLocalizedName(appPath);

  // DMG adımı paketi ürün adıyla aradığı için orada yeniden adlandıramayız;
  // doğrudan kullanılan çıktılarda (ör. `--dir`) paket Türkçe adını alır.
  if (!context.targets.some((target) => target.name === "dmg")) {
    appPath = renameBundle(appPath);
  }

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
