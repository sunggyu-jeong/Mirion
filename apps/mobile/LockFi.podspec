require "json"

Pod::Spec.new do |s|
  s.name         = "LockFi"
  s.version      = "1.0.0"
  s.summary      = "Hardware-backed private key NitroModule for LockFi"
  s.homepage     = "https://lockfi.io"
  s.license      = "MIT"
  s.authors      = { "LockFi" => "dev@lockfi.io" }
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :path => "." }

  s.source_files = [
    "modules/SecureKeyManager/ios/*.{swift,h,mm}",
    "nitrogen/generated/shared/c++/HybridSecureKeyManagerSpec.{hpp,cpp}",
    "nitrogen/generated/ios/c++/HybridSecureKeyManagerSpecSwift.{hpp,cpp}",
    "nitrogen/generated/ios/LockFi-Swift-Cxx-Bridge.{hpp,cpp}",
    "nitrogen/generated/ios/LockFi-Swift-Cxx-Umbrella.hpp",
    "nitrogen/generated/ios/swift/Func_void_bool.swift",
    "nitrogen/generated/ios/swift/Func_void_std__exception_ptr.swift",
    "nitrogen/generated/ios/swift/Func_void_std__variant_nitro__NullType__std__string_.swift",
    "nitrogen/generated/ios/swift/HybridSecureKeyManagerSpec.swift",
    "nitrogen/generated/ios/swift/HybridSecureKeyManagerSpec_cxx.swift",
    "nitrogen/generated/ios/swift/Variant_NullType_String.swift",
  ]

  s.public_header_files = [
    "nitrogen/generated/shared/c++/HybridSecureKeyManagerSpec.hpp",
    "nitrogen/generated/ios/LockFi-Swift-Cxx-Bridge.hpp",
  ]

  s.private_header_files = [
    "nitrogen/generated/ios/c++/HybridSecureKeyManagerSpecSwift.hpp",
  ]

  s.dependency "NitroModules"
  s.dependency "NitroMmkv"

  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    "SWIFT_OBJC_INTEROP_MODE" => "objcxx",
    "DEFINES_MODULE" => "YES",
    "HEADER_SEARCH_PATHS" => [
      "$(PODS_TARGET_SRCROOT)/nitrogen/generated/shared/c++",
      "$(PODS_TARGET_SRCROOT)/nitrogen/generated/ios/c++",
      "$(PODS_TARGET_SRCROOT)/nitrogen/generated/ios",
    ].join(" "),
  }
end
