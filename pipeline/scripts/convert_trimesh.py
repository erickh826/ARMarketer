import trimesh
import time
import sys
import os

def main():
    if len(sys.argv) < 3:
        print("Usage: python convert_trimesh.py <input_path.obj> <output_path.glb>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    # Validation: Check if input file exists
    if not os.path.exists(input_path):
        print(f"Error: Input file not found: {input_path}")
        sys.exit(1)

    # Validation: Basic extension check
    if not input_path.lower().endswith('.obj'):
        print(f"Warning: Input file does not have .obj extension: {input_path}")

    print(f"Loading model: {input_path}")
    t0 = time.time()
    
    try:
        # Load mesh with trimesh
        # force='mesh' ensures we get a Trimesh object even if the file contains multiple objects
        mesh = trimesh.load(input_path, force="mesh")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load model: {str(e)}")
        sys.exit(1)

    t1 = time.time()
    print(f"Loaded in {t1 - t0:.1f}s")
    
    # Report stats
    if hasattr(mesh, 'vertices'):
        print(f"  Vertices: {len(mesh.vertices)}")
    if hasattr(mesh, 'faces'):
        print(f"  Faces: {len(mesh.faces)}")
    
    # Visual check
    has_visual = hasattr(mesh, 'visual')
    print(f"  Has visual data: {has_visual}")
    
    if has_visual and hasattr(mesh.visual, 'material'):
        mat = mesh.visual.material
        if hasattr(mat, 'image') and mat.image:
            print(f"  Texture found: {mat.image.size}")
        else:
            print("  Warning: No texture image found in material.")

    print(f"Exporting to GLB: {output_path}")
    t2 = time.time()
    
    try:
        # Ensure directory for output exists
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        mesh.export(output_path, file_type="glb")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to export GLB: {str(e)}")
        sys.exit(1)

    t3 = time.time()
    
    if os.path.exists(output_path):
        size = os.path.getsize(output_path) / (1024 * 1024)
        print(f"Exported in {t3 - t2:.1f}s")
        print(f"Output size: {size:.2f} MB")
        print(f"Total processing time: {t3 - t0:.1f}s")
    else:
        print("ERROR: Export failed, output file not found.")
        sys.exit(1)

if __name__ == "__main__":
    main()
