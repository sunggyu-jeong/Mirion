require "json"

Pod::Spec.new do |s|
  s.name         = "SecureKeyManager"
  s.version      = "1.0.0"
  s.summary      = "Hardware-backed private key NitroModule for LockFi"
  s.homepage     = "https://lockfi.io"
  s.license      = "MIT"
  s.authors      = { "LockFi" => "dev@lockfi.io" }
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :path => "." }

  nitrogen_root = "#{__dir__}/../../nitrogen/generated"

  s.source_files = [
    "ios/*.{swift,h,mm}",
    "#{nitrogen_root}/shared/c++/*.{hpp,cpp}",
    "#{nitrogen_root}/ios/c++/*.{hpp,cpp}",
    "#{nitrogen_root}/ios/*.{hpp,cpp,mm}",
    "#{nitrogen_root}/ios/swift/*.swift",
  ]

  s.public_header_files = [
    "#{nitrogen_root}/shared/c++/*.{h,hpp}",
    "#{nitrogen_root}/ios/LockFi-Swift-Cxx-Bridge.hpp",
  ]

  s.private_header_files = [
    "#{nitrogen_root}/ios/c++/*.{h,hpp}",
  ]

  s.dependency "NitroModules"

  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++20",
    "SWIFT_OBJC_INTEROP_MODE" => "objcxx",
    "DEFINES_MODULE" => "YES",
    "HEADER_SEARCH_PATHS" => [
      "$(SRCROOT)/../../nitrogen/generated/shared/c++",
      "$(SRCROOT)/../../nitrogen/generated/ios/c++",
      "$(SRCROOT)/../../nitrogen/generated/ios",
    ].join(" "),
  }
end
