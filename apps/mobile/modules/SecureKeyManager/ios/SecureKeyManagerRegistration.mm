#import "LockFi-Swift-Cxx-Umbrella.hpp"
#import "LockFi-Swift-Cxx-Bridge.hpp"
#import <NitroModules/HybridObjectRegistry.hpp>

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
