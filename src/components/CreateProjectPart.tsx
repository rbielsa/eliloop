import { useState } from 'react'
import type { Project, Part } from '../types'
import { createProject, updateProject, persistPartChanges } from '../store/projectStore'

type CreateProjectPartProps = {
  onCreated: (project: Project, part: Part) => void
  onCancel: () => void
}

export function CreateProjectPart({ onCreated, onCancel }: CreateProjectPartProps) {
  const [projectName, setProjectName] = useState('')
  const [partName, setPartName] = useState('')
  const [repeatEvery, setRepeatEvery] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pName = projectName.trim()
    const part = partName.trim()
    if (!pName || !part) return

    let project = await createProject(pName)
    const partObj: Part = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      name: part,
      currentRow: 0,
      repeatEvery: repeatEvery.trim() === '' ? null : Math.max(1, parseInt(repeatEvery, 10) || 0) || null,
      history: [],
    }
    if (partObj.repeatEvery != null && partObj.repeatEvery < 1) partObj.repeatEvery = null
    project.parts = [partObj]
    await updateProject(project)
    await persistPartChanges(project, partObj)
    project = { ...project, parts: [partObj] }
    onCreated(project, partObj)
  }

  return (
    <div className="create-overlay" role="dialog" aria-modal="true" aria-label="Nuevo proyecto y parte">
      <div className="create-panel">
        <h2 className="create-title">Nuevo proyecto</h2>
        <form className="create-form" onSubmit={handleSubmit}>
          <fieldset className="create-fieldset">
            <label htmlFor="create-project">Proyecto</label>
            <input
              id="create-project"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="create-input"
              placeholder="Ej. Chaleco"
              autoComplete="off"
              required
            />
          </fieldset>
          <fieldset className="create-fieldset">
            <label htmlFor="create-part">Parte</label>
            <input
              id="create-part"
              type="text"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              className="create-input"
              placeholder="Ej. Espalda"
              autoComplete="off"
              required
            />
          </fieldset>
          <fieldset className="create-fieldset">
            <label htmlFor="create-repeat">Aviso cada N vueltas (opcional)</label>
            <input
              id="create-repeat"
              type="number"
              min={0}
              value={repeatEvery}
              onChange={(e) => setRepeatEvery(e.target.value)}
              className="create-input"
              placeholder="Sin aviso"
            />
          </fieldset>
          <div className="create-actions">
            <button type="submit" className="create-btn create-btn-primary">
              A tejer
            </button>
            <button type="button" className="create-btn create-btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <div className="create-backdrop" onClick={onCancel} aria-hidden />
    </div>
  )
}
