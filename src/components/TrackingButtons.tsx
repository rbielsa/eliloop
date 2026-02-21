import { useState } from 'react'

type TrackingButtonsProps = {
  onPlus1: () => void
  onPlus2: () => void
  onSetRow: (row: number) => void
  onSave: () => void
}

export function TrackingButtons({ onPlus1, onPlus2, onSetRow, onSave }: TrackingButtonsProps) {
  const [goToRow, setGoToRow] = useState('')

  const handleGoTo = () => {
    const n = parseInt(goToRow, 10)
    if (!Number.isNaN(n) && n >= 0) {
      onSetRow(n)
      setGoToRow('')
    }
  }

  return (
    <div className="tracking-buttons glass">
      <div className="tracking-buttons-row">
        <button type="button" className="tracking-btn tracking-btn-plus" onClick={onPlus1}>
          +1
        </button>
        <button type="button" className="tracking-btn tracking-btn-plus" onClick={onPlus2}>
          +2
        </button>
      </div>
      <div className="tracking-buttons-row tracking-buttons-goto">
        <input
          type="number"
          min={0}
          className="tracking-input"
          placeholder="Ir a vuelta…"
          value={goToRow}
          onChange={(e) => setGoToRow(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGoTo()}
        />
        <button
          type="button"
          className="tracking-btn tracking-btn-goto"
          onClick={handleGoTo}
          disabled={goToRow === ''}
        >
          Ir
        </button>
      </div>
      <button type="button" className="tracking-btn tracking-btn-save" onClick={onSave}>
        Guardar y salir
      </button>
    </div>
  )
}
