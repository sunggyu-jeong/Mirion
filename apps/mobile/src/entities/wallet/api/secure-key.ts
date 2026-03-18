import { NitroModules } from 'react-native-nitro-modules';

import type { SecureKeyManager } from '@modules/SecureKeyManager/spec/SecureKeyManager.nitro';

const manager = NitroModules.createHybridObject<SecureKeyManager>('SecureKeyManager');

export const secureKey = {
  has: (keyId: string): boolean => manager.hasPrivateKey(keyId),

  delete: (keyId: string): boolean => manager.deletePrivateKey(keyId),

  generate: (keyId: string): Promise<boolean> => manager.generateAndStorePrivateKey(keyId),

  retrieve: (keyId: string): Promise<string | null> => manager.retrievePrivateKey(keyId),
};
