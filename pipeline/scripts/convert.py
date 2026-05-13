import bpy
import os
import sys
import argparse

def clear_scene():
    """Removes all objects, meshes, and materials from the current scene."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    for mesh in bpy.data.meshes:
        bpy.data.meshes.remove(mesh)
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)
    for tex in bpy.data.textures:
        bpy.data.textures.remove(tex)
    for img in bpy.data.images:
        bpy.data.images.remove(img)

def convert_model(input_path, output_path):
    """
    Imports a model (FBX or OBJ) and exports it as an optimized GLB.
    """
    clear_scene()
    
    ext = os.path.splitext(input_path)[1].lower()
    
    print(f"Importing: {input_path}")
    
    if ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=input_path)
    elif ext == '.obj':
        # Blender 3.x+ uses the new C++ OBJ importer by default
        bpy.ops.wm.obj_import(filepath=input_path)
    else:
        print(f"Unsupported extension: {ext}")
        return False

    # Basic cleanup: Remove cameras and lights if any were imported
    for obj in bpy.context.scene.objects:
        if obj.type in ['CAMERA', 'LIGHT']:
            bpy.data.objects.remove(obj, do_unlink=True)

    # Ensure the model is centered (Optional but recommended for AR)
    # bpy.ops.object.select_all(action='SELECT')
    # bpy.ops.view3d.snap_selected_to_cursor(use_offset=False)

    print(f"Exporting to: {output_path}")
    
    # Export to GLB with DRACO compression enabled
    # These settings prioritize high compression for web delivery
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_image_format='AUTO',
        export_texture_dir='textures',
        export_apply=True
    )
    
    return True

if __name__ == "__main__":
    # Internal Blender argument parsing
    argv = sys.argv
    if "--" not in argv:
        argv = []
    else:
        argv = argv[argv.index("--") + 1:]

    parser = argparse.ArgumentParser(description='Convert FBX/OBJ to optimized GLB using Blender.')
    parser.add_argument('--input', help='Input model file path', required=True)
    parser.add_argument('--output', help='Output GLB file path', required=True)
    
    args = parser.parse_args(argv)
    
    success = convert_model(args.input, args.output)
    
    if success:
        print("Conversion successful.")
        sys.exit(0)
    else:
        print("Conversion failed.")
        sys.exit(1)
