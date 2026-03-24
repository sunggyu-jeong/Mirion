// Standard React Native New Architecture setup
#include <DefaultComponentsRegistry.h>
#include <DefaultTurboModuleManagerDelegate.h>
#include <FBReactNativeSpec.h>
#include <autolinking.h>
#include <fbjni/fbjni.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>

// SecureKeyManager (Nitrogen Nitro Module)
#include <NitroModules/HybridObjectRegistry.hpp>
#include "SecureKeyManagerOnLoad.hpp"
#include "JHybridSecureKeyManagerSpec.hpp"

namespace facebook::react {

void registerComponents(
    std::shared_ptr<const ComponentDescriptorProviderRegistry> registry) {
  autolinking_registerProviders(registry);
}

std::shared_ptr<TurboModule> cxxModuleProvider(
    const std::string& name,
    const std::shared_ptr<CallInvoker>& jsInvoker) {
  return autolinking_cxxModuleProvider(name, jsInvoker);
}

std::shared_ptr<TurboModule> javaModuleProvider(
    const std::string& name,
    const JavaTurboModule::InitParams& params) {
  // React Native core modules (PlatformConstants, etc.)
  if (auto module = FBReactNativeSpec_ModuleProvider(name, params)) {
    return module;
  }
  // 3rd party autolinked modules
  if (auto module = autolinking_ModuleProvider(name, params)) {
    return module;
  }
  return nullptr;
}

} // namespace facebook::react

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, [] {
    // Register React Native core TurboModule providers
    facebook::react::DefaultTurboModuleManagerDelegate::cxxModuleProvider =
        &facebook::react::cxxModuleProvider;
    facebook::react::DefaultTurboModuleManagerDelegate::javaModuleProvider =
        &facebook::react::javaModuleProvider;

    // Register Fabric component descriptors
    facebook::react::DefaultComponentsRegistry::
        registerComponentDescriptorsFromEntryPoint =
            &facebook::react::registerComponents;

    // Register SecureKeyManager (Nitrogen)
    margelo::nitro::lockfi::securekeymanager::registerAllNatives();

    margelo::nitro::HybridObjectRegistry::registerHybridObjectConstructor(
        "SecureKeyManager",
        []() -> std::shared_ptr<margelo::nitro::HybridObject> {
          using namespace margelo::nitro::lockfi::securekeymanager;
          static auto cls = facebook::jni::make_global(
              facebook::jni::findClassStatic(
                  "com/lockfi/securekeymanager/HybridSecureKeyManager"));
          static auto ctor =
              cls->getConstructor<JHybridSecureKeyManagerSpec::JavaPart::
                                      javaobject()>();
          auto rawObj = cls->newObject(ctor);
          auto javaPart =
              facebook::jni::static_ref_cast<
                  JHybridSecureKeyManagerSpec::JavaPart>(std::move(rawObj));
          return std::make_shared<JHybridSecureKeyManagerSpec>(javaPart);
        });
  });
}
