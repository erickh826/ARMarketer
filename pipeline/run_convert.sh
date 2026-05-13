#!/bin/bash

# Configuration
IMAGE_NAME="armarketer-converter"
INPUT_DIR="$(pwd)/input"
OUTPUT_DIR="$(pwd)/output"

# Ensure directories exist
mkdir -p "$INPUT_DIR" "$OUTPUT_DIR"

# Build the image (only needs to be done once or when Dockerfile changes)
if [[ "$(docker images -q $IMAGE_NAME 2> /dev/null)" == "" ]]; then
  echo "Building Docker image $IMAGE_NAME..."
  docker build -t "$IMAGE_NAME" .
fi

# Check for input file
if [ -z "$1" ]; then
  echo "Usage: ./run_convert.sh <filename_in_input_folder>"
  exit 1
fi

INPUT_FILE=$1
OUTPUT_FILE="${INPUT_FILE%.*}.glb"

echo "Converting $INPUT_FILE to $OUTPUT_FILE..."

# Run the conversion
docker run --rm \
  -v "$INPUT_DIR:/app/input" \
  -v "$OUTPUT_DIR:/app/output" \
  "$IMAGE_NAME" \
  --input "/app/input/$INPUT_FILE" \
  --output "/app/output/$OUTPUT_FILE"

# Post-processing optimization with gltf-transform
# This applies Draco compression again and simplifies textures if needed
echo "Applying post-processing optimizations..."
docker run --rm \
  -v "$OUTPUT_DIR:/app/output" \
  --entrypoint "gltf-transform" \
  "$IMAGE_NAME" \
  optimize "/app/output/$OUTPUT_FILE" "/app/output/$OUTPUT_FILE" --texture-compress ktx2

echo "Done! Optimized model is at: $OUTPUT_DIR/$OUTPUT_FILE"
