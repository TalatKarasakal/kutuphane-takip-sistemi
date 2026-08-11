const path = require("path");
const { signAsync } = require("@electron/osx-sign");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  if (require("os").platform() !== "darwin") return; // codesign is macOS-only
  if (context.appOutDir.endsWith("-temp")) return; // Universal birleştirmeden önce iki mimariyi ayrı imzalama.
  if (process.env.CSC_LINK || process.env.CSC_NAME) return; // electron-builder gerçek kimlikle imzalar

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);
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
