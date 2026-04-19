const path = require('path');
const { signAsync } = require('@electron/osx-sign');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  const entitlements = path.join(__dirname, 'entitlements.plist');

  console.log(`[afterPack] ad-hoc signing ${appPath}`);

  await signAsync({
    app: appPath,
    identity: '-',
    identityValidation: false,
    type: 'distribution',
    hardenedRuntime: false,
    preAutoEntitlements: false,
    preEmbedProvisioningProfile: false,
    optionsForFile: () => ({ entitlements }),
  });
};
