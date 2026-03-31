const { MMKV } = require('react-native-mmkv');

const store = new MMKV({ id: 'walletconnect' });

function getKeys() {
  return Promise.resolve(store.getAllKeys());
}

function getEntries() {
  const keys = store.getAllKeys();
  const entries = keys.map(key => {
    const raw = store.getString(key);
    let value;
    try { value = raw !== undefined ? JSON.parse(raw) : undefined; } catch { value = raw; }
    return [key, value];
  });
  return Promise.resolve(entries);
}

function getItem(key) {
  const raw = store.getString(key);
  if (raw === undefined) return Promise.resolve(undefined);
  try { return Promise.resolve(JSON.parse(raw)); } catch { return Promise.resolve(raw); }
}

function setItem(key, value) {
  store.set(key, JSON.stringify(value));
  return Promise.resolve();
}

function removeItem(key) {
  store.delete(key);
  return Promise.resolve();
}

class KeyValueStorage {
  getKeys() { return getKeys(); }
  getEntries() { return getEntries(); }
  getItem(key) { return getItem(key); }
  setItem(key, value) { return setItem(key, value); }
  removeItem(key) { return removeItem(key); }
}

class IKeyValueStorage {}

function parseEntry(entry) {
  let value;
  try { value = entry[1] != null ? JSON.parse(entry[1]) : undefined; } catch { value = entry[1]; }
  return [entry[0], value];
}

exports.IKeyValueStorage = IKeyValueStorage;
exports.KeyValueStorage = KeyValueStorage;
exports.default = KeyValueStorage;
exports.parseEntry = parseEntry;
