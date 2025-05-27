#!/bin/bash

# Simple Docker Build Script
set -e

IMAGE_NAME="registry.services.nandev.net/nan/blog-mdx"

# Build for AMD64 to ensure compatibility with most deployment platforms
DOCKER_PLATFORM="linux/amd64"

echo "🚀 Building Docker image for $DOCKER_PLATFORM..."

# Enable BuildKit and build
export DOCKER_BUILDKIT=1

docker build \
    --platform="$DOCKER_PLATFORM" \
    --tag "$IMAGE_NAME:latest" \
    .

echo "✅ Build completed!"
echo "📦 Image: $IMAGE_NAME:latest"
echo "🏗️  Platform: $DOCKER_PLATFORM"

# Show image size
SIZE=$(docker images "$IMAGE_NAME:latest" --format "{{.Size}}")
echo "📏 Size: $SIZE" 