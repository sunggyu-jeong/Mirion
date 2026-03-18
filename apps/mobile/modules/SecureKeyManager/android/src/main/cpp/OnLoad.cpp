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
        auto constructor = cls->getConstructor<JObject()>();
        auto javaObj = cls->newObject(constructor);
        auto javaPart = dynamic_ref_cast<JHybridSecureKeyManagerSpec::JavaPart>(javaObj);
        return std::make_shared<JHybridSecureKeyManagerSpec>(javaPart);
      }
    );
  });
}
