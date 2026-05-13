#!/bin/bash

# Hardened error handling
set -e
set -o pipefail

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
IMAGE_NAME="armarketer-converter"
INPUT_DIR="$SCRIPT_DIR/input"
OUTPUT_DIR="$SCRIPT_DIR/output"

# Ensure directories exist
mkdir -p "$INPUT_DIR" "$OUTPUT_DIR"

echo "Using script directory: $SCRIPT_DIR"

# Build the image from the script directory context
if [[ "$(docker images -q $IMAGE_NAME 2> /dev/null)" == "" ]]; then
  echo "Building Docker image $IMAGE_NAME..."
  docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"
fi

# Check for input file
if [ -z "$1" ]; then
  echo "Usage: $0 <filename_in_input_folder>"
  exit 1
fi

INPUT_FILE=$1
OUTPUT_FILE="${INPUT_FILE%.*}.glb"

# Check if input file actually exists in the input directory
if [ ! -f "$INPUT_DIR/$INPUT_FILE" ]; then
  echo "Error: Input file $INPUT_DIR/$INPUT_FILE not found."
  exit 1
fi

echo "Converting $INPUT_FILE to $OUTPUT_FILE..."

# Run the conversion
docker run --rm \
  -v "$INPUT_DIR:/app/input" \
  -v "$OUTPUT_DIR:/app/output" \
  "$IMAGE_NAME" \
  --input "/app/input/$INPUT_FILE" \
  --output "/app/output/$OUTPUT_FILE"

# Post-processing optimization with gltf-transform
echo "Applying post-processing optimizations..."
docker run --rm \
  -v "$OUTPUT_DIR:/app/output" \
  --entrypoint "gltf-transform" \
  "$IMAGE_NAME" \
  optimize "/app/output/$OUTPUT_FILE" "/app/output/$OUTPUT_FILE" --texture-compress ktx2

echo "Done! Optimized model is at: $OUTPUT_DIR/$OUTPUT_FILE"
