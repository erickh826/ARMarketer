# 系統架構

## 3.1 Stack 選型
- **Viewer (AR/VR/3D):** React 18, Vite, Three.js, React Three Fiber, **MindAR (Image Tracking)**, Tailwind CSS
- **CMS:** Next.js 14, Tailwind CSS, Headless UI
- **Backend:** Node.js + Express, PostgreSQL, Prisma, Redis, S3/R2
- **Processing Pipeline:** **Blender (Headless)**, **gltf-transform**, **Draco**, **KTX2**
- **DevOps:** Docker, Nginx, Cloudflare CDN, GitHub Actions

## 3.3 資料模型（核心新增）
- **ImageTarget:** id, project_id, name, source_image_url, compiled_mind_url, compile_status, physical_width_cm, bound_experience_id
- **ARExperience:** id, project_id, name, image_target_id, content_type, content_scene_id, transform, animation_config, audio_url
