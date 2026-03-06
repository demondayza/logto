#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-myeyesid/log2}"
IMAGE_TAG="${IMAGE_TAG:-dev}"

echo "Building ${IMAGE_NAME}:${IMAGE_TAG} with fresh layers..."
IMAGE_NAME="${IMAGE_NAME}" IMAGE_TAG="${IMAGE_TAG}" docker compose build --pull --no-cache app

echo "Starting containers with forced recreation..."
IMAGE_NAME="${IMAGE_NAME}" IMAGE_TAG="${IMAGE_TAG}" docker compose up -d --force-recreate --remove-orphans

echo "Compose services:"
docker compose ps
