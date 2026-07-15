import type { Hotspot, Vec3, EditorMode } from './HotspotEditor'

const SIDEBAR_WIDTH = '280px'

interface EditorSidebarProps {
  mode: EditorMode
  hotspots: Hotspot[]
  selectedId: string | null
  pendingPosition: Vec3 | null
  form: { title: string; description: string; targetUrl: string }
  saving: boolean
  onModeChange: (mode: EditorMode) => void
  onSelectHotspot: (id: string | null) => void
  onFormChange: (field: keyof EditorSidebarProps['form'], value: string) => void
  onSave: () => void
  onDelete: (id: string) => void
  onCancelAdd: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: '4px',
  border: '1px solid #374151',
  background: '#1f2937',
  color: '#f9fafb',
  fontSize: '13px',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#9ca3af',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export const EditorSidebar = ({
  mode, hotspots, selectedId, pendingPosition, form, saving,
  onModeChange, onSelectHotspot, onFormChange, onSave, onDelete, onCancelAdd,
}: EditorSidebarProps) => {
  const selectedHotspot = hotspots.find((h) => h.id === selectedId) ?? null

  return (
    <div style={{
      width: SIDEBAR_WIDTH,
      flexShrink: 0,
      background: '#111827',
      color: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #1f2937',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #1f2937' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
          Hotspot 編輯器
        </div>
        <button
          onClick={() => mode === 'add' ? onCancelAdd() : onModeChange('add')}
          disabled={saving}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            background: mode === 'add' ? '#374151' : '#3b82f6',
            color: 'white',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {mode === 'add' ? '× 取消放置' : '+ 新增 Hotspot'}
        </button>
      </div>

      {/* Add form — appears when user has clicked a position */}
      {mode === 'add' && pendingPosition && (
        <div style={{ padding: '16px', borderBottom: '1px solid #1f2937', background: '#1a2535' }}>
          <div style={{ fontSize: '12px', color: '#60a5fa', marginBottom: '12px' }}>
            位置已選定 ({pendingPosition.x.toFixed(2)}, {pendingPosition.y.toFixed(2)}, {pendingPosition.z.toFixed(2)})
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>標題 *</label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              placeholder="Hotspot 名稱"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>說明</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '56px' }}
              value={form.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              placeholder="選填說明文字"
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>連結 URL</label>
            <input
              style={inputStyle}
              value={form.targetUrl}
              onChange={(e) => onFormChange('targetUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <button
            onClick={onSave}
            disabled={!form.title.trim() || saving}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              background: form.title.trim() ? '#10b981' : '#374151',
              color: 'white',
              fontSize: '13px',
              cursor: form.title.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 500,
            }}
          >
            {saving ? '儲存中...' : '儲存 Hotspot'}
          </button>
        </div>
      )}

      {/* Edit panel — shown when a hotspot is selected in view mode */}
      {mode === 'edit' && selectedHotspot && (
        <div style={{ padding: '16px', borderBottom: '1px solid #1f2937', background: '#1a2535' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
            編輯 Hotspot
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>標題 *</label>
            <input
              style={inputStyle}
              value={form.title}
              onChange={(e) => onFormChange('title', e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>說明</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '56px' }}
              value={form.description}
              onChange={(e) => onFormChange('description', e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>連結 URL</label>
            <input
              style={inputStyle}
              value={form.targetUrl}
              onChange={(e) => onFormChange('targetUrl', e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onSave}
              disabled={!form.title.trim() || saving}
              style={{
                flex: 1,
                padding: '7px',
                borderRadius: '6px',
                border: 'none',
                background: form.title.trim() ? '#10b981' : '#374151',
                color: 'white',
                fontSize: '13px',
                cursor: form.title.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
            <button
              onClick={() => onModeChange('view')}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid #374151',
                background: 'transparent',
                color: '#9ca3af',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Hotspot list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {hotspots.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginTop: '32px', padding: '0 16px' }}>
            尚無 Hotspot。<br />點擊「新增 Hotspot」後在模型上點選位置。
          </div>
        ) : (
          hotspots.map((h) => (
            <div
              key={h.id}
              onClick={() => {
                onSelectHotspot(h.id)
                onModeChange('edit')
                onFormChange('title', h.title)
                onFormChange('description', h.description ?? '')
                onFormChange('targetUrl', h.targetUrl ?? '')
              }}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                marginBottom: '4px',
                background: selectedId === h.id ? '#1e3a5f' : '#1f2937',
                border: `1px solid ${selectedId === h.id ? '#3b82f6' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#f3f4f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.title}
                </div>
                {h.description && (
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {h.description}
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '3px' }}>
                  ({h.position.x.toFixed(2)}, {h.position.y.toFixed(2)}, {h.position.z.toFixed(2)})
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(h.id) }}
                title="刪除"
                style={{
                  marginLeft: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1,
                  padding: '0 2px',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
