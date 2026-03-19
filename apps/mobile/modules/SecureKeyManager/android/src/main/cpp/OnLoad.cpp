#include <jni.h>
#include <fbjni/fbjni.h>
#include <NitroModules/HybridObjectRegistry.hpp>
#include "SecureKeyManagerOnLoad.hpp"
#include "JHybridSecureKeyManagerSpec.hpp"

using namespace facebook::jni;
using namespace margelo::nitro;
using namespace margelo::nitro::lockfi::securekeymanager;

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    registerAllNatives();

    HybridObjectRegistry::registerHybridObjectConstructor(
      "SecureKeyManager",
      []() -> std::shared_ptr<HybridObject> {
        static auto cls = make_global(
          findClassStatic("com/lockfi/securekeymanager/HybridSecureKeyManager")
        );
        static auto ctor = cls->getConstructor<JHybridSecureKeyManagerSpec::JavaPart::javaobject()>();
        auto rawObj = cls->newObject(ctor);
        auto javaPart = static_ref_cast<JHybridSecureKeyManagerSpec::JavaPart>(std::move(rawObj));
        return std::make_shared<JHybridSecureKeyManagerSpec>(javaPart);
      }
    );
  });
}
