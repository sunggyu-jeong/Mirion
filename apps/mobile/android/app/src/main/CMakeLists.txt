cmake_minimum_required(VERSION 3.22.1)
project(SecureKeyManager)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(MOBILE_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../..")
set(NITROGEN_ROOT "${MOBILE_ROOT}/nitrogen/generated")
set(MODULE_ROOT "${MOBILE_ROOT}/modules/SecureKeyManager")

add_definitions(-DBUILDING_SECUREKEYMANAGER_WITH_GENERATED_CMAKE_PROJECT)
add_definitions(-DRN_SERIALIZABLE_STATE)
add_definitions(
  -DFOLLY_NO_CONFIG=1
  -DFOLLY_HAVE_CLOCK_GETTIME=1
  -DFOLLY_USE_LIBCPP=1
  -DFOLLY_CFG_NO_COROUTINES=1
  -DFOLLY_MOBILE=1
  -DFOLLY_HAVE_RECVMMSG=1
  -DFOLLY_HAVE_PTHREAD=1
  -DFOLLY_HAVE_XSI_STRERROR_R=1
)

include_directories(
  "${NITROGEN_ROOT}/shared/c++"
  "${NITROGEN_ROOT}/android/c++"
  "${NITROGEN_ROOT}/android"
)

add_library(
  SecureKeyManager
  SHARED
  "${NITROGEN_ROOT}/android/SecureKeyManagerOnLoad.cpp"
  "${NITROGEN_ROOT}/shared/c++/HybridSecureKeyManagerSpec.cpp"
  "${NITROGEN_ROOT}/android/c++/JHybridSecureKeyManagerSpec.cpp"
  "${NITROGEN_ROOT}/android/c++/JVariant_NullType_String.cpp"
  "${MODULE_ROOT}/android/src/main/cpp/OnLoad.cpp"
)

find_package(fbjni REQUIRED)
find_package(ReactAndroid REQUIRED)
find_package(react-native-nitro-modules REQUIRED)

target_link_libraries(
  SecureKeyManager
  fbjni::fbjni
  ReactAndroid::jsi
  react-native-nitro-modules::NitroModules
  ReactAndroid::reactnative
)
