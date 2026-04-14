#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/../ios"
PBXPROJ="$PROJECT_DIR/Mirion.xcodeproj/project.pbxproj"

if [ ! -d "$SCRIPT_DIR/Frameworks" ] || [ -z "$(ls -A "$SCRIPT_DIR/Frameworks")" ]; then
  echo "error: Frameworks/ 디렉토리가 비어있습니다. 먼저 ./build_xcframeworks.sh 를 실행하세요."
  exit 1
fi

if ! grep -q "C3D4E5F6A1B2C3D4E5F6A1B2" "$PBXPROJ"; then
  python3 - "$PBXPROJ" <<'EOF'
import sys, re

path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

build_file = '\t\tC3D4E5F6A1B2C3D4E5F6A1B2 /* ReactNativePrebuild in Frameworks */ = {isa = PBXBuildFile; productRef = B2C3D4E5F6A1B2C3D4E5F6A1 /* ReactNativePrebuild */; };\n'
content = content.replace(
    '/* End PBXBuildFile section */',
    build_file + '/* End PBXBuildFile section */'
)

framework_entry = '\t\t\t\tC3D4E5F6A1B2C3D4E5F6A1B2 /* ReactNativePrebuild in Frameworks */,\n'
content = content.replace(
    '\t\t\t\t0C80B921A6F3F58F76C31292 /* libPods-Mirion.a in Frameworks */,',
    '\t\t\t\t0C80B921A6F3F58F76C31292 /* libPods-Mirion.a in Frameworks */,\n' + framework_entry.rstrip('\n')
)

pkg_deps = '\t\t\tpackageProductDependencies = (\n\t\t\t\tB2C3D4E5F6A1B2C3D4E5F6A1 /* ReactNativePrebuild */,\n\t\t\t);\n'
content = content.replace(
    '\t\t\tname = Mirion;\n\t\t\tproductName = Mirion;',
    pkg_deps + '\t\t\tname = Mirion;\n\t\t\tproductName = Mirion;'
)

with open(path, 'w') as f:
    f.write(content)

print("project.pbxproj 패치 완료")
EOF
fi

echo ""
echo "SPM 활성화 완료."
echo "이제 macOS에서 아래 명령을 실행하세요:"
echo "  cd $PROJECT_DIR && pod install"

