import { useState } from 'react'
import type { Project, Part } from '../types'
import { persistPartChanges, deletePartFromProject } from '../store/projectStore'

type PartSettingsProps = {
  project: Project
  part: Part
  onClose: () => void
  onSaved: (project: Project, part: Part | null) => void
}

export function PartSettings({ project, part, onClose, onSaved }: PartSettingsProps) {
  const [name, setName] = useState(part.name)
  const [repeatEvery, setRepeatEvery] = useState(
    part.repeatEvery != null && part.repeatEvery > 0 ? String(part.repeatEvery) : ''
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const n = repeatEvery === '' ? null : parseInt(repeatEvery, 10)
    const validRepeat = n != null && n > 0 ? n : null
    const partUpdated = {
      ...part,
      name: trimmedName,
      repeatEvery: validRepeat,
    }
    await persistPartChanges(project, partUpdated)
    const projectUpdated = {
      ...project,
      parts: project.parts.map((p) => (p.id === part.id ? partUpdated : p)),
    }
    onSaved(projectUpdated, partUpdated)
    onClose()
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    const projectUpdated = await deletePartFromProject(project, part.id)
    onSaved(projectUpdated, null)
    onClose()
  }

  return (
    <div className="part-settings-overlay" role="dialog" aria-modal="true" aria-label="Ajustes de parte">
      <div className="part-settings glass">
        <div className="part-settings-header">
          <h2>Ajustes</h2>
          <button type="button" className="part-settings-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <form
          className="part-settings-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          <fieldset className="part-settings-fieldset">
            <label htmlFor="part-name">Nombre de parte</label>
            <input
              id="part-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="part-settings-input"
              autoComplete="off"
            />
          </fieldset>
          <fieldset className="part-settings-fieldset">
            <label htmlFor="part-repeat">Avisa cada N vueltas (0 = sin aviso)</label>
            <input
              id="part-repeat"
              type="number"
              min={0}
              value={repeatEvery}
              onChange={(e) => setRepeatEvery(e.target.value)}
              className="part-settings-input"
              placeholder="0"
            />
          </fieldset>
          <div className="part-settings-actions">
            <button type="submit" className="part-settings-save">
              Guardar
            </button>
            <button type="button" className="part-settings-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
        <div className="part-settings-danger">
          <button
            type="button"
            className={`part-settings-delete ${confirmDelete ? 'confirm' : ''}`}
            onClick={handleDelete}
          >
            {confirmDelete ? '¿Borrar? Pulsa otra vez' : 'Borrar parte'}
          </button>
        </div>
      </div>
      <div className="part-settings-backdrop" onClick={onClose} aria-hidden />
    </div>
  )
}
