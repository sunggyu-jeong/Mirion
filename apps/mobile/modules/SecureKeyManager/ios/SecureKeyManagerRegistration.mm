#import "LockFi-Swift-Cxx-Umbrella.hpp"
#import "LockFi-Swift-Cxx-Bridge.hpp"
#import <NitroModules/HybridObjectRegistry.hpp>
#import <Foundation/Foundation.h>

// Dummy ObjC symbol — forces the -ObjC linker flag to include this
// translation unit, which ensures the C++ constructor below is executed.
@interface __SecureKeyManagerRegistrationLoader : NSObject @end
@implementation __SecureKeyManagerRegistrationLoader @end

extern "C" void* SecureKeyManagerFactory_create() noexcept;

__attribute__((constructor))
static void registerSecureKeyManager() {
  margelo::nitro::HybridObjectRegistry::registerHybridObjectConstructor(
    "SecureKeyManager",
    []() -> std::shared_ptr<margelo::nitro::HybridObject> {
      void* ptr = SecureKeyManagerFactory_create();
      return margelo::nitro::lockfi::securekeymanager::bridge::swift::create_std__shared_ptr_HybridSecureKeyManagerSpec_(ptr);
    }
  );
}
