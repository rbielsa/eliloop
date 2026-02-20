import { useEffect, useRef, useState } from 'react'
import { vibrate } from '../services/audioService'

type RowDisplayProps = {
  currentRow: number
  repeatEvery: number | null
}

const RING_SIZE = 200
const RING_STROKE = 6
const RING_R = (RING_SIZE - RING_STROKE) / 2
const RING_C = RING_SIZE / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

export function RowDisplay({ currentRow, repeatEvery }: RowDisplayProps) {
  const prevRowRef = useRef(currentRow)
  const [bump, setBump] = useState(false)
  const [ringComplete, setRingComplete] = useState(false)

  useEffect(() => {
    if (currentRow !== prevRowRef.current) {
      prevRowRef.current = currentRow
      setBump(true)
      vibrate(50)
      const t = setTimeout(() => setBump(false), 400)
      return () => clearTimeout(t)
    }
  }, [currentRow])

  const showRing = repeatEvery != null && repeatEvery > 0
  const progress =
    showRing && repeatEvery > 0
      ? (currentRow % repeatEvery) / repeatEvery
      : 0
  const isAtMultiple = showRing && repeatEvery > 0 && currentRow > 0 && currentRow % repeatEvery === 0

  useEffect(() => {
    if (isAtMultiple) {
      setRingComplete(true)
      const t = setTimeout(() => setRingComplete(false), 600)
      return () => clearTimeout(t)
    }
  }, [currentRow, repeatEvery, isAtMultiple])

  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)

  return (
    <div className="row-display glass">
      <div className="row-display-inner">
        {showRing && (
          <svg
            className={`progress-ring ${ringComplete ? 'ring-complete' : ''}`}
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            aria-hidden
          >
            <circle
              className="progress-ring-bg"
              cx={RING_C}
              cy={RING_C}
              r={RING_R}
              fill="none"
              strokeWidth={RING_STROKE}
            />
            <circle
              className="progress-ring-fill"
              cx={RING_C}
              cy={RING_C}
              r={RING_R}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${RING_C} ${RING_C})`}
            />
          </svg>
        )}
        <span className={`row-number ${bump ? 'row-bump' : ''}`}>{currentRow}</span>
      </div>
    </div>
  )
}
