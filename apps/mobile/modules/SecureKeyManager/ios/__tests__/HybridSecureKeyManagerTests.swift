import XCTest
@testable import LockFi

final class HybridSecureKeyManagerTests: XCTestCase {
  private var sut: HybridSecureKeyManager!
  private let testKeyId = "test-key-\(UUID().uuidString)"

  override func setUp() {
    super.setUp()
    sut = HybridSecureKeyManager()
  }

  override func tearDown() {
    try? sut.deletePrivateKey(keyId: testKeyId)
    sut = nil
    super.tearDown()
  }

  func test_hasPrivateKey_returnsFalse_whenKeyDoesNotExist() throws {
    XCTAssertFalse(try sut.hasPrivateKey(keyId: testKeyId))
  }

  func test_generateAndStorePrivateKey_storesKey() async throws {
    let promise = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    let success = try await withCheckedThrowingContinuation { continuation in
      promise
        .then { continuation.resume(returning: $0) }
        .catch { continuation.resume(throwing: $0) }
    }
    XCTAssertTrue(success)
    XCTAssertTrue(try sut.hasPrivateKey(keyId: testKeyId))
  }

  func test_generateAndStorePrivateKey_isIdempotent() async throws {
    let promise1 = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    _ = try await awaitPromise(promise1)
    let promise2 = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    let success = try await awaitPromise(promise2)
    XCTAssertTrue(success)
    XCTAssertTrue(try sut.hasPrivateKey(keyId: testKeyId))
  }

  func test_retrievePrivateKey_returnsNil_whenKeyDoesNotExist() async throws {
    let promise = try sut.retrievePrivateKey(keyId: testKeyId)
    let result = try await awaitPromise(promise)
    if case .first = result { } else {
      XCTFail("Expected null variant")
    }
  }

  func test_retrievePrivateKey_returnsHexString_afterGeneration() async throws {
    let genPromise = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    _ = try await awaitPromise(genPromise)

    let retrievePromise = try sut.retrievePrivateKey(keyId: testKeyId)
    let result = try await awaitPromise(retrievePromise)

    guard case .second(let hex) = result else {
      XCTFail("Expected string variant")
      return
    }
    XCTAssertEqual(hex.count, 64)
    XCTAssertTrue(hex.allSatisfy { $0.isHexDigit })
  }

  func test_retrievePrivateKey_returnsDifferentKey_afterOverwrite() async throws {
    let gen1 = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    _ = try await awaitPromise(gen1)
    let retrieve1 = try sut.retrievePrivateKey(keyId: testKeyId)
    let result1 = try await awaitPromise(retrieve1)
    guard case .second(let hex1) = result1 else { XCTFail(); return }

    let gen2 = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    _ = try await awaitPromise(gen2)
    let retrieve2 = try sut.retrievePrivateKey(keyId: testKeyId)
    let result2 = try await awaitPromise(retrieve2)
    guard case .second(let hex2) = result2 else { XCTFail(); return }

    XCTAssertNotEqual(hex1, hex2)
  }

  func test_deletePrivateKey_removesKey() async throws {
    let gen = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    _ = try await awaitPromise(gen)
    XCTAssertTrue(try sut.deletePrivateKey(keyId: testKeyId))
    XCTAssertFalse(try sut.hasPrivateKey(keyId: testKeyId))
  }

  func test_deletePrivateKey_returnsTrueForNonExistentKey() throws {
    XCTAssertTrue(try sut.deletePrivateKey(keyId: "nonexistent-\(UUID().uuidString)"))
  }

  func test_generatedKey_is32Bytes() async throws {
    let gen = try sut.generateAndStorePrivateKey(keyId: testKeyId)
    _ = try await awaitPromise(gen)
    let retrieve = try sut.retrievePrivateKey(keyId: testKeyId)
    let result = try await awaitPromise(retrieve)
    guard case .second(let hex) = result else { XCTFail(); return }
    XCTAssertEqual(hex.count, 64, "32 bytes = 64 hex chars")
  }

  func test_twoKeys_areIndependent() async throws {
    let keyId2 = "test-key-2-\(UUID().uuidString)"
    defer { try? sut.deletePrivateKey(keyId: keyId2) }

    _ = try await awaitPromise(try sut.generateAndStorePrivateKey(keyId: testKeyId))
    _ = try await awaitPromise(try sut.generateAndStorePrivateKey(keyId: keyId2))

    XCTAssertTrue(try sut.hasPrivateKey(keyId: testKeyId))
    XCTAssertTrue(try sut.hasPrivateKey(keyId: keyId2))

    XCTAssertTrue(try sut.deletePrivateKey(keyId: testKeyId))
    XCTAssertFalse(try sut.hasPrivateKey(keyId: testKeyId))
    XCTAssertTrue(try sut.hasPrivateKey(keyId: keyId2))
  }

  private func awaitPromise<T>(_ promise: Promise<T>) async throws -> T {
    try await withCheckedThrowingContinuation { continuation in
      promise
        .then { continuation.resume(returning: $0) }
        .catch { continuation.resume(throwing: $0) }
    }
  }
}
