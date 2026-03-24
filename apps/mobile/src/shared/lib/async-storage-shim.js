'use strict';

// AsyncStorage shim backed by react-native-mmkv
// Required by @metamask/sdk which imports @react-native-async-storage/async-storage

const { MMKV } = require('react-native-mmkv');

let storage;
function getStorage() {
  if (!storage) {
    storage = new MMKV({ id: 'metamask-sdk-storage' });
  }
  return storage;
}

const AsyncStorage = {
  getItem: async (key) => {
    try {
      const value = getStorage().getString(key);
      return value !== undefined ? value : null;
    } catch {
      return null;
    }
  },

  setItem: async (key, value) => {
    getStorage().set(key, value);
  },

  removeItem: async (key) => {
    getStorage().delete(key);
  },

  mergeItem: async (key, value) => {
    const existing = getStorage().getString(key);
    if (existing) {
      const merged = { ...JSON.parse(existing), ...JSON.parse(value) };
      getStorage().set(key, JSON.stringify(merged));
    } else {
      getStorage().set(key, value);
    }
  },

  clear: async () => {
    getStorage().clearAll();
  },

  getAllKeys: async () => {
    return getStorage().getAllKeys();
  },

  multiGet: async (keys) => {
    return keys.map(key => [key, getStorage().getString(key) ?? null]);
  },

  multiSet: async (pairs) => {
    for (const [key, value] of pairs) {
      getStorage().set(key, value);
    }
  },

  multiRemove: async (keys) => {
    for (const key of keys) {
      getStorage().delete(key);
    }
  },

  flushGetRequests: () => {},
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
