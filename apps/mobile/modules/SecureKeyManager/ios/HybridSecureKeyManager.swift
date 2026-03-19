import Foundation
import LocalAuthentication
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
      return try self.storeToKeychain(keyId: keyId, data: data, requiresBiometric: true)
    }
  }

  public func retrievePrivateKey(keyId: String) throws -> Promise<Variant_NullType_String> {
    Promise.async { [weak self] in
      guard let self else { return .first(NullType.null) }

      let context = LAContext()
      context.touchIDAuthenticationAllowableReuseDuration = 10

      var authSuccess = false
      var authError: Error?
      let semaphore = DispatchSemaphore(value: 0)
      context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: "개인키 접근을 인증합니다"
      ) { success, error in
        authSuccess = success
        authError = error
        semaphore.signal()
      }
      semaphore.wait()
      guard authSuccess else { throw authError ?? KeychainError.biometricFailed }

      var query = self.baseQuery(keyId: keyId)
      query[kSecReturnData as String] = true
      query[kSecUseAuthenticationContext as String] = context
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

  public func storeData(keyId: String, data: String) throws -> Promise<Bool> {
    Promise.async { [weak self] in
      guard let self else { return false }
      guard let dataBytes = data.data(using: .utf8) else { return false }
      return try self.storeToKeychain(keyId: keyId, data: dataBytes)
    }
  }

  public func retrieveData(keyId: String) throws -> Promise<Variant_NullType_String> {
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
      guard let str = String(data: data, encoding: .utf8) else {
        throw KeychainError.readFailed(errSecInternalError)
      }
      return .second(str)
    }
  }

  private func storeToKeychain(keyId: String, data: Data, requiresBiometric: Bool = false) throws -> Bool {
    var query = baseQuery(keyId: keyId)
    SecItemDelete(query as CFDictionary)
    query[kSecValueData as String] = data

    if requiresBiometric {
      guard let accessControl = SecAccessControlCreateWithFlags(
        nil,
        kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
        .biometryAny,
        nil
      ) else { throw KeychainError.writeFailed(errSecParam) }
      query[kSecAttrAccessControl as String] = accessControl
    } else {
      query[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    }

    let status = SecItemAdd(query as CFDictionary, nil)
    guard status == errSecSuccess else { throw KeychainError.writeFailed(status) }
    return true
  }

  private func baseQuery(keyId: String) -> [String: Any] {
    [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: Self.service,
      kSecAttrAccount as String: keyId,
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
  case biometricFailed
}
