# FBX Texture Mapping

Problem: FBX uploaded successfully, but external textures did not map. The loader only exposed a blob-like token instead of real texture filenames, so `setURLModifier()` alone could not resolve the images.

Fix: Keep the URL remap path, then add a fallback that assigns uploaded textures by material name and common filename suffixes such as `Base_Color`, `Opacity`, `Normal`, `AO`, and `Metallic`.

Result: `Greenhouse.fbx` works with the uploaded `textures` folder.