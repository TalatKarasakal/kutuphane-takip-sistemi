#!/usr/bin/env node
// Manually package macOS app bundle without renaming signed internals.
// electron-builder's rename step breaks ad-hoc signatures on macOS 15+.
// This script keeps the executable name as "Electron" but updates
// display names, bundle id, icons via Info.plist only.

import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

const APP_NAME = pkg.productName || pkg.name;
const APP_VERSION = pkg.version;
const BUNDLE_ID = pkg.build?.appId || `com.example.${pkg.name}`;

const release = resolve(root, 'release');
const outAppDir = resolve(release, 'mac-arm64');
const outApp = resolve(outAppDir, `${APP_NAME}.app`);
const dmgPath = resolve(release, `${APP_NAME}-${APP_VERSION}-arm64.dmg`);
const electronApp = resolve(root, 'node_modules', 'electron', 'dist', 'Electron.app');

console.log('[mac] cleaning', outAppDir);
rmSync(outAppDir, { recursive: true, force: true });
rmSync(dmgPath, { force: true });
mkdirSync(outAppDir, { recursive: true });

console.log('[mac] copying Electron.app →', outApp);
cpSync(electronApp, outApp, { recursive: true, verbatimSymlinks: true });

const appDir = resolve(outApp, 'Contents', 'Resources', 'app');
mkdirSync(appDir, { recursive: true });

console.log('[mac] copying app files');
for (const f of ['dist', 'electron', 'package.json']) {
  cpSync(resolve(root, f), resolve(appDir, f), { recursive: true });
}
// prod deps only (skip heavy devDeps like electron/electron-builder)
const prodDeps = Object.keys(pkg.dependencies || {});
mkdirSync(resolve(appDir, 'node_modules'), { recursive: true });
for (const dep of prodDeps) {
  const src = resolve(root, 'node_modules', dep);
  if (existsSync(src)) {
    cpSync(src, resolve(appDir, 'node_modules', dep), { recursive: true });
  }
}

console.log('[mac] writing minimal package.json');
const miniPkg = {
  name: pkg.name,
  productName: APP_NAME,
  version: APP_VERSION,
  main: pkg.main,
  dependencies: pkg.dependencies || {},
};
writeFileSync(resolve(appDir, 'package.json'), JSON.stringify(miniPkg, null, 2));

console.log('[mac] patching Info.plist');
const plist = resolve(outApp, 'Contents', 'Info.plist');
const set = (key, val) => execSync(`/usr/libexec/PlistBuddy -c "Set :${key} ${val}" "${plist}"`, { stdio: 'inherit' });
const setOrAdd = (key, val, type = 'string') => {
  try { set(key, val); } catch { execSync(`/usr/libexec/PlistBuddy -c "Add :${key} ${type} ${val}" "${plist}"`, { stdio: 'inherit' }); }
};
setOrAdd('CFBundleDisplayName', APP_NAME);
setOrAdd('CFBundleName', APP_NAME);
setOrAdd('CFBundleIdentifier', BUNDLE_ID);
setOrAdd('CFBundleShortVersionString', APP_VERSION);
setOrAdd('CFBundleVersion', APP_VERSION);

console.log('[mac] creating DMG');
const tmpDmg = resolve(release, '.tmp.dmg');
rmSync(tmpDmg, { force: true });
execSync(
  `hdiutil create -srcfolder "${outApp}" -volname "${APP_NAME}" -fs APFS -format UDRW -ov "${tmpDmg}"`,
  { stdio: 'inherit' },
);
execSync(`hdiutil convert "${tmpDmg}" -format UDZO -o "${dmgPath}"`, { stdio: 'inherit' });
rmSync(tmpDmg, { force: true });

console.log(`\n[mac] done → ${dmgPath}`);
