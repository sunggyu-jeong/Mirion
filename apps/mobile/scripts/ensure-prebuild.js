const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MOBILE_DIR = path.resolve(__dirname, '..');
const PREBUILD_DIR = path.join(MOBILE_DIR, 'react_native_prebuild');
const FRAMEWORKS_DIR = path.join(PREBUILD_DIR, 'Frameworks');
const HASH_FILE = path.join(PREBUILD_DIR, '.prebuild_hash');

const FILES_TO_WATCH = [
  path.join(MOBILE_DIR, 'package.json'),
  path.join(MOBILE_DIR, '../../pnpm-lock.yaml'),
  path.join(PREBUILD_DIR, 'Podfile'),
  path.join(PREBUILD_DIR, 'package.json'),
];

function calculateHash() {
  const hash = crypto.createHash('sha256');
  for (const file of FILES_TO_WATCH) {
    if (fs.existsSync(file)) {
      hash.update(fs.readFileSync(file));
    }
  }
  return hash.digest('hex');
}

function runScript(scriptName, args = []) {
  const result = spawnSync('bash', [scriptName, ...args], {
    cwd: PREBUILD_DIR,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(1);
  }
}

const currentHash = calculateHash();
const savedHash = fs.existsSync(HASH_FILE) ? fs.readFileSync(HASH_FILE, 'utf8') : '';
const frameworksExist = fs.existsSync(FRAMEWORKS_DIR) && fs.readdirSync(FRAMEWORKS_DIR).length > 0;

if (currentHash !== savedHash || !frameworksExist) {
  runScript('build_xcframeworks.sh');
  runScript('activate_spm.sh');
  fs.writeFileSync(HASH_FILE, currentHash);
}
