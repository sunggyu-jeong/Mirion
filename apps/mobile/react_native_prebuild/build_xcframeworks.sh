#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

pnpm install

gem install xcodeproj --no-document 2>/dev/null || true
ruby create_project.rb

pod install

ARCHIVE_DIR="$SCRIPT_DIR/archives"
FRAMEWORK_DIR="$SCRIPT_DIR/Frameworks"
rm -rf "$ARCHIVE_DIR" "$FRAMEWORK_DIR"
mkdir -p "$FRAMEWORK_DIR"

xcodebuild archive \
  -workspace RNPrebuild.xcworkspace \
  -scheme RNPrebuild \
  -configuration Release \
  -destination "generic/platform=iOS Simulator" \
  -archivePath "$ARCHIVE_DIR/simulator.xcarchive" \
  SKIP_INSTALL=NO \
  BUILD_LIBRARY_FOR_DISTRIBUTION=YES

xcodebuild archive \
  -workspace RNPrebuild.xcworkspace \
  -scheme RNPrebuild \
  -configuration Release \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_DIR/device.xcarchive" \
  SKIP_INSTALL=NO \
  BUILD_LIBRARY_FOR_DISTRIBUTION=YES

SIM_FRAMEWORKS="$ARCHIVE_DIR/simulator.xcarchive/Products/Library/Frameworks"
DEV_FRAMEWORKS="$ARCHIVE_DIR/device.xcarchive/Products/Library/Frameworks"

find "$SIM_FRAMEWORKS" -name "*.framework" -maxdepth 1 | while read -r sim_fw; do
  name=$(basename "$sim_fw" .framework)
  dev_fw="$DEV_FRAMEWORKS/${name}.framework"
  if [ -d "$dev_fw" ]; then
    xcodebuild -create-xcframework \
      -framework "$sim_fw" \
      -framework "$dev_fw" \
      -output "$FRAMEWORK_DIR/${name}.xcframework"
  else
    xcodebuild -create-xcframework \
      -framework "$sim_fw" \
      -output "$FRAMEWORK_DIR/${name}.xcframework"
  fi
done

ruby generate_package_swift.rb
