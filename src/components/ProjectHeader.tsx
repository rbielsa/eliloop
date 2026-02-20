type ProjectHeaderProps = {
  projectName: string | null
  partName: string | null
}

export function ProjectHeader({ projectName, partName }: ProjectHeaderProps) {
  return (
    <header className="project-header glass">
      {projectName && <h1 className="project-name">{projectName}</h1>}
      {partName && <p className="part-name">{partName}</p>}
      {!projectName && !partName && (
        <p className="project-name placeholder">EliLoop</p>
      )}
    </header>
  )
}
