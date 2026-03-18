import Foundation
import Security
import NitroModules

public class HybridSecureKeyManager: HybridSecureKeyManagerSpec {
  private static let service = "com.lockfi.wallet"
  private let queue = DispatchQueue(label: "com.lockfi.securekeymanager", qos: .userInitiated)

  public func hasPrivateKey(keyId: String) throws -> Bool {
    SecItemCopyMatching(baseQuery(keyId: keyId) as CFDictionary, nil) == errSecSuccess
  }

  public func deletePrivateKey(keyId: String) throws -> Bool {
    let status = SecItemDelete(baseQuery(keyId: keyId) as CFDictionary)
    return status == errSecSuccess || status == errSecItemNotFound
  }

  public func generateAndStorePrivateKey(keyId: String) throws -> Promise<Bool> {
    Promise.async { [weak self] in
      guard let self else { return false }
      var rawBytes = [UInt8](repeating: 0, count: 32)
      let status = SecRandomCopyBytes(kSecRandomDefault, rawBytes.count, &rawBytes)
      guard status == errSecSuccess else {
        throw KeychainError.randomGenerationFailed(status)
      }
      let data = Data(rawBytes)
      rawBytes.withUnsafeMutableBytes { $0.initialize(repeating: 0) }
      return try self.storeToKeychain(keyId: keyId, data: data)
    }
  }

  public func retrievePrivateKey(keyId: String) throws -> Promise<Variant_NullType_String> {
    Promise.async { [weak self] in
      guard let self else { return .first(NullType.null) }
      var query = self.baseQuery(keyId: keyId)
      query[kSecReturnData as String] = true
      var result: AnyObject?
      let status = SecItemCopyMatching(query as CFDictionary, &result)
      if status == errSecItemNotFound { return .first(NullType.null) }
      guard status == errSecSuccess, let data = result as? Data else {
        throw KeychainError.readFailed(status)
      }
      let hex = data.map { String(format: "%02x", $0) }.joined()
      return .second(hex)
    }
  }

  private func storeToKeychain(keyId: String, data: Data) throws -> Bool {
    var query = baseQuery(keyId: keyId)
    SecItemDelete(query as CFDictionary)
    query[kSecValueData as String] = data
    let status = SecItemAdd(query as CFDictionary, nil)
    guard status == errSecSuccess else { throw KeychainError.writeFailed(status) }
    return true
  }

  private func baseQuery(keyId: String) -> [String: Any] {
    [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: Self.service,
      kSecAttrAccount as String: keyId,
      kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    ]
  }
}

@_cdecl("SecureKeyManagerFactory_create")
public func SecureKeyManagerFactory_create() -> UnsafeMutableRawPointer {
  HybridSecureKeyManager().getCxxWrapper().toUnsafe()
}

enum KeychainError: Error {
  case randomGenerationFailed(OSStatus)
  case writeFailed(OSStatus)
  case readFailed(OSStatus)
}
