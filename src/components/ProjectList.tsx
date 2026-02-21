import type { Project } from '../types'

type ProjectListProps = {
  projects: Project[]
  onSelectPart: (project: Project, partId: string) => void
}

export function ProjectList({ projects, onSelectPart }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="project-list-empty glass">
        <p>Sin proyectos</p>
        <p className="project-list-hint">
          Pulsa <strong>Nuevo proyecto</strong> para crear uno y empezar a tejer
        </p>
      </div>
    )
  }

  return (
    <div className="project-list">
      {projects.map((proj) => (
        <div key={proj.id} className="project-card glass">
          <h2 className="project-card-name">{proj.name}</h2>
          {proj.parts.length === 0 && (
            <p className="project-card-empty">Sin partes</p>
          )}
          <ul className="project-card-parts">
            {proj.parts.map((part) => (
              <li key={part.id}>
                <button
                  type="button"
                  className="part-button"
                  onClick={() => onSelectPart(proj, part.id)}
                >
                  <span className="part-button-name">{part.name}</span>
                  <span className="part-button-meta">
                  <span className="part-button-row">vuelta {part.currentRow}</span>
                  {part.repeatEvery != null && part.repeatEvery > 0 && (
                    <span className="part-button-repeat">cada {part.repeatEvery}</span>
                  )}
                </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
