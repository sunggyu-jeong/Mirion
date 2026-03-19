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
    "nitrogen/generated/shared/c++/*.{hpp,cpp}",
    "nitrogen/generated/ios/c++/*.{hpp,cpp}",
    "nitrogen/generated/ios/*.{hpp,cpp,mm}",
    "nitrogen/generated/ios/swift/*.swift",
  ]

  s.public_header_files = [
    "nitrogen/generated/shared/c++/*.{h,hpp}",
    "nitrogen/generated/ios/LockFi-Swift-Cxx-Bridge.hpp",
  ]

  s.private_header_files = [
    "nitrogen/generated/ios/c++/*.{h,hpp}",
  ]

  s.dependency "NitroModules"

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
