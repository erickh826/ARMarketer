import trimesh
import time
import sys
import os

input_path = sys.argv[1]
output_path = sys.argv[2]

print(f"Loading OBJ: {input_path}")
t0 = time.time()
mesh = trimesh.load(input_path, force="mesh")
t1 = time.time()
print(f"Loaded in {t1 - t0:.1f}s")
print(f"  Vertices: {len(mesh.vertices)}")
print(f"  Faces: {len(mesh.faces)}")
print(f"  Has visual: {hasattr(mesh, 'visual')}")
if hasattr(mesh, "visual") and hasattr(mesh.visual, "material"):
    mat = mesh.visual.material
    if hasattr(mat, "image"):
        print(f"  Texture: {mat.image.size if mat.image else 'none'}")

print(f"Exporting GLB: {output_path}")
t2 = time.time()
mesh.export(output_path, file_type="glb")
t3 = time.time()
print(f"Exported in {t3 - t2:.1f}s")

size = os.path.getsize(output_path) / (1024 * 1024)
print(f"Output size: {size:.2f} MB")
print(f"Total time: {t3 - t0:.1f}s")
