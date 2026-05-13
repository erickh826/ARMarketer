# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV BLENDER_VERSION 4.1.0
ENV BLENDER_URL https://download.blender.org/release/Blender4.1/blender-4.1.0-linux-x64.tar.xz

# Install dependencies for Blender and gltf-transform
RUN apt-get update && apt-get install -y \
    curl \
    xz-utils \
    libxrender1 \
    libxtst6 \
    libxi6 \
    libglu1-mesa \
    libxkbcommon0 \
    libsm6 \
    libice6 \
    libdbus-1-3 \
    libfontconfig1 \
    libxcursor1 \
    libxrandr2 \
    libxinerama1 \
    libasound2 \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Blender
RUN mkdir /usr/local/blender \
    && curl -L ${BLENDER_URL} | tar -xJ -C /usr/local/blender --strip-components=1

# Add Blender to PATH
ENV PATH="/usr/local/blender:${PATH}"

# Install gltf-transform and its sharp-based extensions for texture optimization
RUN npm install --global @gltf-transform/cli @gltf-transform/extensions @gltf-transform/functions

# Set the working directory
WORKDIR /app

# Copy scripts
COPY scripts/ /app/scripts/

# Create input/output directories
RUN mkdir -p /app/input /app/output

# Default command (can be overridden)
# Example usage:
# docker run -v ./models:/app/input converter-image blender -b -P scripts/convert.py -- --input /app/input/model.fbx --output /app/output/model.glb
ENTRYPOINT ["blender", "-b", "-P", "/app/scripts/convert.py", "--"]
