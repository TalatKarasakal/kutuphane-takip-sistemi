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
      `\uFEFF"CFBundleDisplayName" = "${DISPLAY_NAME}";\n"CFBundleName" = "${DISPLAY_NAME}";\n`,
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
  // Türkçe ad buradan gelir: paketin klasör adı ASCII kalsa da Finder ve Dock
  // `CFBundleDisplayName`i gösterir (package.json'da LSHasLocalizedDisplayName).
  // Klasörü burada yeniden adlandırmak electron-builder'ın paketleme sonrası
  // yaptığı `app.asar` denetimini kırıyordu: denetim paketi hâlâ ürün adıyla
  // arıyor. Türkçe klasör adını çıktıyı kuran taraf verir (scripts/install-mac.sh).
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
