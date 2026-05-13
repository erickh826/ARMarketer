# 系統架構

## 3.1 Stack 選型
- **Viewer (AR/VR/3D):** React 18, Vite, Three.js, React Three Fiber, **MindAR (Image Tracking)**, Tailwind CSS
- **CMS:** Next.js 14, Tailwind CSS, Headless UI
- **Backend:** Node.js + Express, PostgreSQL, Prisma, Redis, S3/R2
- **Processing Pipeline:** **Blender (Headless)**, **gltf-transform**, **Draco**, **KTX2**
- **DevOps:** Docker, Nginx, Cloudflare CDN, GitHub Actions

## 3.3 資料模型（核心新增）
- **ImageTarget:** id, project_id, name, source_image_url, compiled_mind_url, compile_status, physical_width_cm, bound_experience_id
- **ARExperience:** id, project_id, name, image_target_id, media_asset_id, content_type, content_scene_id, transform, animation_config, audio_url
- **MediaAsset:** id, project_id, name, kind, original_filename, mime_type, storage_provider, storage_key, source_asset_id, original_url, processed_url, source_format, processed_format, file_size_bytes, checksum_sha256, processing_job_id, status, metadata

### 欄位責任補充

- `media_asset_id`：ARExperience 實際使用的主要內容資產。
- `content_scene_id`：保留給 viewer / scene 的輔助識別，不應作為主要素材 URL 或資產追蹤欄位。
