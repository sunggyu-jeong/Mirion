import { type HybridObject } from 'react-native-nitro-modules'

export interface SecureKeyManager
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  hasPrivateKey(keyId: string): boolean
  deletePrivateKey(keyId: string): boolean
  generateAndStorePrivateKey(keyId: string): Promise<boolean>
  retrievePrivateKey(keyId: string): Promise<string | null>
  storeData(keyId: string, data: string): Promise<boolean>
  retrieveData(keyId: string): Promise<string | null>
}
