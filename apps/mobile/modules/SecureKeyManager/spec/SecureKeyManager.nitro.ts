import { type HybridObject } from 'react-native-nitro-modules';

export interface SecureKeyManager extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  hasPrivateKey(_keyId: string): boolean;
  deletePrivateKey(_keyId: string): boolean;
  generateAndStorePrivateKey(_keyId: string): Promise<boolean>;
  retrievePrivateKey(_keyId: string): Promise<string | null>;
  storeData(_keyId: string, _data: string): Promise<boolean>;
  retrieveData(_keyId: string): Promise<string | null>;
}
