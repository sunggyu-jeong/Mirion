cmake_minimum_required(VERSION 3.13)

# Project name = shared library name. React Native SoLoader expects libappmodules.so
project(appmodules)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include React Native's standard app CMake setup.
# REACT_ANDROID_DIR and PROJECT_BUILD_DIR are injected by the RN Gradle plugin.
# This will:
#   - Pick up our OnLoad.cpp (in this directory) + generated autolinking sources
#   - Link React Native, fbjni, JSI, and all autolinked 3rd party libraries
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

# Add SecureKeyManager C++ sources and link Nitro dependencies
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/SecureKeyManager+autolinking.cmake)
