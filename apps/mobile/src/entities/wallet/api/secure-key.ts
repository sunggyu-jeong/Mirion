import type { SecureKeyManager } from '@modules/SecureKeyManager/spec/SecureKeyManager.nitro';
import { NitroModules } from 'react-native-nitro-modules';

let _manager: SecureKeyManager | null = null;
const getManager = (): SecureKeyManager => {
  if (!_manager) {
    _manager = NitroModules.createHybridObject<SecureKeyManager>('SecureKeyManager');
  }
  return _manager;
};

export const secureKey = {
  has: (keyId: string): boolean => getManager().hasPrivateKey(keyId),

  delete: (keyId: string): boolean => getManager().deletePrivateKey(keyId),

  generate: (keyId: string): Promise<boolean> => getManager().generateAndStorePrivateKey(keyId),

  retrieve: (keyId: string): Promise<string | null> => getManager().retrievePrivateKey(keyId),

  store: (keyId: string, data: string): Promise<boolean> => getManager().storeData(keyId, data),

  retrieveData: (keyId: string): Promise<string | null> => getManager().retrieveData(keyId),
};
