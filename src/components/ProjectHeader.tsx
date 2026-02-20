type ProjectHeaderProps = {
  projectName: string | null
  partName: string | null
  onSettingsClick?: () => void
}

export function ProjectHeader({ projectName, partName, onSettingsClick }: ProjectHeaderProps) {
  return (
    <header className="project-header glass">
      <div className="project-header-row">
        {projectName && <h1 className="project-name">{projectName}</h1>}
        {onSettingsClick && partName && (
          <button
            type="button"
            className="project-header-settings"
            onClick={onSettingsClick}
            aria-label="Ajustes de parte"
          >
            ⚙
          </button>
        )}
      </div>
      {partName && <p className="part-name">{partName}</p>}
      {!projectName && !partName && (
        <p className="project-name placeholder">EliLoop</p>
      )}
    </header>
  )
}
