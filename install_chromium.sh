#!/bin/bash
set -e

# Define version and platform
# Using a recent stable version suitable for automation
VERSION="121.0.6167.85"
PLATFORM="linux64"
URL="https://storage.googleapis.com/chrome-for-testing-public/${VERSION}/${PLATFORM}/chrome-linux64.zip"

echo "Downloading Chromium ${VERSION} for ${PLATFORM}..."
curl -L -o chromium.zip "$URL"

echo "Extracting..."
unzip -q chromium.zip -d chromium_temp
mv chromium_temp/chrome-linux64/* chromium/
rm -rf chromium_temp chromium.zip

echo "Chromium installed to ./chromium/"
./chromium/chrome --version
