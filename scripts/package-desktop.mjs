// Packages the already-built app (dist/) into a stand-alone desktop app folder.
// Usage: node scripts/package-desktop.mjs <win32|darwin|linux> <x64|arm64>
import { packager } from '@electron/packager';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [platform = 'win32', arch = 'x64'] = process.argv.slice(2);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('dist/ not found - run "npm run build" first.');
  process.exit(1);
}

// Stage a clean app folder: only the built web files + the Electron shell
const stage = path.join(root, 'release', '.stage');
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
fs.cpSync(path.join(root, 'dist'), path.join(stage, 'dist'), { recursive: true });
fs.cpSync(path.join(root, 'electron'), path.join(stage, 'electron'), { recursive: true });
fs.writeFileSync(
  path.join(stage, 'package.json'),
  JSON.stringify({ name: pkg.name, productName: pkg.productName, version: pkg.version, description: pkg.description, main: 'electron/main.cjs' }, null, 2)
);

const iconExt = platform === 'win32' ? 'ico' : platform === 'darwin' ? 'icns' : 'png';
const icon = path.join(root, 'build', `icon.${iconExt}`);

const [outDir] = await packager({
  dir: stage,
  out: path.join(root, 'release'),
  name: pkg.productName,
  platform,
  arch,
  overwrite: true,
  asar: false,
  prune: false,
  // On Linux hosts the packager needs Wine to stamp an icon into a Windows exe, so that is done below with resedit instead.
  ...(platform !== 'win32' && fs.existsSync(icon) ? { icon } : {}),
});

if (platform === 'win32') {
  const ResEdit = await import('resedit');
  const exePath = path.join(outDir, `${pkg.productName}.exe`);
  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);
  const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(root, 'build', 'icon.ico')));
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  for (const g of groups) {
    ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, g.id, g.lang, iconFile.icons.map((i) => i.data));
  }
  const [vi] = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  if (vi) {
    vi.setStringValues(
      { lang: 1033, codepage: 1200 },
      { FileDescription: pkg.productName, ProductName: pkg.productName, InternalName: pkg.productName, OriginalFilename: `${pkg.productName}.exe`, CompanyName: '', LegalCopyright: '' }
    );
    vi.outputToResourceEntries(res.entries);
  }
  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
}

fs.rmSync(stage, { recursive: true, force: true });
console.log('Packaged:', outDir);
