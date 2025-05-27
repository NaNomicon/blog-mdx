#!/bin/bash

# Simple Docker Build Script
set -e

IMAGE_NAME="registry.services.nandev.net/nan/blog-mdx"

# Build for AMD64 to ensure compatibility with most deployment platforms
DOCKER_PLATFORM="linux/amd64"

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

echo "🚀 Building Docker image for $DOCKER_PLATFORM..."
echo "📦 Version: v$VERSION"

# Enable BuildKit and build
export DOCKER_BUILDKIT=1

docker build \
    --platform="$DOCKER_PLATFORM" \
    --tag "$IMAGE_NAME:latest" \
    --tag "$IMAGE_NAME:v$VERSION" \
    .

echo "✅ Build completed!"
echo "📦 Image: $IMAGE_NAME:latest"
echo "📦 Image: $IMAGE_NAME:v$VERSION"
echo "🏗️  Platform: $DOCKER_PLATFORM"

# Show image size
SIZE=$(docker images "$IMAGE_NAME:latest" --format "{{.Size}}")
echo "📏 Size: $SIZE" 