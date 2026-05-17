#!/usr/bin/env bash
# build-notifee.sh
# Builds notifee from source and replaces pre-built blobs in node_modules.
# Run this from the root of your React Native project.

set -euo pipefail

# conf
NOTIFEE_VERSION=$(node -p "require('./node_modules/@notifee/react-native/package.json').version")
WORK_DIR="$(pwd)/.notifee-build"
REPO_URL="https://github.com/invertase/notifee.git"
AAR_VERSION="202108261754"
TARGET_AAR="node_modules/@notifee/react-native/android/libs/app/notifee/core/${AAR_VERSION}/core-${AAR_VERSION}.aar"

# def didn't steal that
info()    { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
success() { echo -e "\033[1;32m[OK]\033[0m    $*"; }
warn()    { echo -e "\033[1;33m[WARN]\033[0m  $*"; }
die()     { echo -e "\033[1;31m[ERROR]\033[0m $*" >&2; exit 1; }

info "Checking prerequisites..."

command -v git  >/dev/null || die "git is not installed."
command -v java >/dev/null || die "java is not installed."
command -v yarn >/dev/null || die "yarn is not installed."
command -v node >/dev/null || die "node is not installed."

#JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d. -f1)
#if [[ "$JAVA_VER" -gt 17 ]]; then
#  die "Java $JAVA_VER detected. notifee's Gradle 7 requires Java 11 or 17. Please set JAVA_HOME to a JDK <= 17."
#fi
#success "Java $JAVA_VER — OK"

[[ -d "node_modules/@notifee/react-native" ]] \
  || die "node_modules/@notifee/react-native not found. Run yarn install first."

info "Detected @notifee/react-native version: $NOTIFEE_VERSION"

info "Cloning notifee repo (tag @notifee/react-native@${NOTIFEE_VERSION})..."
rm -rf "$WORK_DIR"
git clone --depth 1 --branch "@notifee/react-native@${NOTIFEE_VERSION}" \
  "$REPO_URL" "$WORK_DIR" \
  || die "Clone failed. Does tag @notifee/react-native@${NOTIFEE_VERSION} exist?"

info "Installing JS dependencies..."
cd "$WORK_DIR"
yarn install --frozen-lockfile --ignore-scripts

info "Building Android core AAR from source..."

rm -f "packages/react-native/android/libs/app/notifee/core/${AAR_VERSION}/core-${AAR_VERSION}.aar"
rm -f "packages/flutter/packages/notifee/android/libs/app/notifee/core/${AAR_VERSION}/core-${AAR_VERSION}.aar"

cd android

info "Changing gradle version to one that support java 21"
sed -i 's#distributionUrl=.*#distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip#' gradle/wrapper/gradle-wrapper.properties

./gradlew assembleRelease compileDebugJavaWithJavac compileDebugUnitTestJavaWithJavac publish \
  || die "Gradle build failed."
cd "$WORK_DIR"

BUILT_AAR="packages/react-native/android/libs/app/notifee/core/${AAR_VERSION}/core-${AAR_VERSION}.aar"
[[ -f "$BUILT_AAR" ]] || die "Expected AAR not found after build: $BUILT_AAR"

SO_COUNT=$(unzip -l "$BUILT_AAR" | grep -c "\.so" || true)
if [[ "$SO_COUNT" -gt 0 ]]; then
  warn "AAR contains $SO_COUNT .so file(s) — review for proprietary native libs!"
else
  success "No native .so blobs in AAR."
fi

cd - > /dev/null

info "Replacing pre-built blob in node_modules..."
TARGET_DIR="$(dirname "$TARGET_AAR")"
mkdir -p "$TARGET_DIR"

if [[ -f "$TARGET_AAR" ]]; then
  cp "$TARGET_AAR" "${TARGET_AAR}.orig.bak"
  info "Original blob backed up to ${TARGET_AAR}.orig.bak"
fi

cp "${WORK_DIR}/${BUILT_AAR}" "$TARGET_AAR"
success "Replaced: $TARGET_AAR"

info "Cleaning up build directory..."
rm -rf "$WORK_DIR"

success "Done! notifee AAR was built from source and installed into node_modules."
