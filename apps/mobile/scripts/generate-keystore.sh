#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYSTORE_PATH="$SCRIPT_DIR/../android/app/release.keystore"
KEY_ALIAS="mirion"

if [ -f "$KEYSTORE_PATH" ]; then
  echo "release.keystore already exists. Skipping."
  exit 0
fi

read -rsp "Keystore password: " STORE_PASS; echo
read -rsp "Key password: " KEY_PASS; echo

keytool -genkey -v \
  -keystore "$KEYSTORE_PATH" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=Mirion, OU=Mobile, O=Mirion, L=Seoul, S=Seoul, C=KR"

echo ""
echo "Keystore created: $KEYSTORE_PATH"
echo ""
echo "Run the following to encode for GitHub Secrets:"
echo "  base64 -i $KEYSTORE_PATH | tr -d '\\n' | pbcopy"
echo ""
echo "GitHub Secrets to set:"
echo "  ANDROID_KEYSTORE_BASE64  = (clipboard)"
echo "  ANDROID_KEYSTORE_PASSWORD = <store password you entered>"
echo "  ANDROID_KEY_ALIAS         = $KEY_ALIAS"
echo "  ANDROID_KEY_PASSWORD      = <key password you entered>"

