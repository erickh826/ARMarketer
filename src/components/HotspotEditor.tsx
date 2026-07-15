import { useState, useEffect, useCallback } from 'react'
import { EditorCanvas } from './EditorCanvas'
import { EditorSidebar } from './EditorSidebar'

export type Vec3 = { x: number; y: number; z: number }

export type EditorMode = 'view' | 'add' | 'edit'

export interface Hotspot {
  id: string
  experienceId: string
  title: string
  description: string | null
  targetUrl: string | null
  position: Vec3
  normal: Vec3 | null
  createdAt: string
  updatedAt: string
}

interface HotspotEditorProps {
  experienceId: string
  assetUrl: string
  assetType: 'obj' | 'glb'
  apiKey?: string
  apiBase?: string
}

const EMPTY_FORM = { title: '', description: '', targetUrl: '' }

export const HotspotEditor = ({
  experienceId,
  assetUrl,
  assetType,
  apiKey,
  apiBase = 'http://localhost:3001',
}: HotspotEditorProps) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [mode, setMode] = useState<EditorMode>('view')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingPosition, setPendingPosition] = useState<Vec3 | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey

  const fetchHotspots = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/experiences/${experienceId}/hotspots`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setHotspots(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hotspots')
    }
  }, [experienceId, apiBase])

  useEffect(() => { fetchHotspots() }, [fetchHotspots])

  const handlePlaced = (pos: Vec3) => {
    setPendingPosition(pos)
    setForm(EMPTY_FORM)
  }

  const handleFormChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (mode === 'add' && pendingPosition) {
        const res = await fetch(`${apiBase}/api/experiences/${experienceId}/hotspots`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            targetUrl: form.targetUrl.trim() || undefined,
            position: pendingPosition,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const created: Hotspot = await res.json()
        setHotspots((prev) => [...prev, created])
        setPendingPosition(null)
        setMode('view')
        setSelectedId(created.id)
      } else if (mode === 'edit' && selectedId) {
        const res = await fetch(`${apiBase}/api/hotspots/${selectedId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || null,
            targetUrl: form.targetUrl.trim() || null,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const updated: Hotspot = await res.json()
        setHotspots((prev) => prev.map((h) => h.id === updated.id ? updated : h))
        setMode('view')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/api/hotspots/${id}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setHotspots((prev) => prev.filter((h) => h.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setMode('view')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelAdd = () => {
    setMode('view')
    setPendingPosition(null)
    setForm(EMPTY_FORM)
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#0f172a', overflow: 'hidden' }}>
      <EditorSidebar
        mode={mode}
        hotspots={hotspots}
        selectedId={selectedId}
        pendingPosition={pendingPosition}
        form={form}
        saving={saving}
        onModeChange={setMode}
        onSelectHotspot={setSelectedId}
        onFormChange={handleFormChange}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancelAdd={handleCancelAdd}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        {error && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(220,38,38,0.9)',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            zIndex: 20,
          }}>
            {error}
          </div>
        )}
        <EditorCanvas
          assetUrl={assetUrl}
          assetType={assetType}
          addMode={mode === 'add'}
          hotspots={hotspots}
          selectedId={selectedId}
          onPlaced={handlePlaced}
          onSelectHotspot={(id) => {
            const h = hotspots.find((hs) => hs.id === id)
            if (!h) return
            setSelectedId(id)
            setMode('edit')
            setForm({ title: h.title, description: h.description ?? '', targetUrl: h.targetUrl ?? '' })
          }}
        />
      </div>
    </div>
  )
}
