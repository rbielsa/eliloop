type RowDisplayProps = {
  currentRow: number
}

export function RowDisplay({ currentRow }: RowDisplayProps) {
  return (
    <div className="row-display glass">
      <span className="row-number">{currentRow}</span>
    </div>
  )
}
