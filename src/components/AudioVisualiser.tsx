import { useEffect, useRef, useState } from 'react'
import { startAnalyser, getFrequencyData } from '../services/audioAnalyser'

const BAR_COUNT = 16
const MAX_HEIGHT = 48

type AudioVisualiserProps = {
  active: boolean
}

export function AudioVisualiser({ active }: AudioVisualiserProps) {
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0))
  const cleanupRef = useRef<(() => void) | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      setLevels(Array(BAR_COUNT).fill(0))
      return
    }
    let mounted = true
    startAnalyser().then((result) => {
      if (!mounted || !result) return
      const { analyser, cleanup } = result
      cleanupRef.current = cleanup
      const tick = () => {
        if (!mounted) return
        const data = getFrequencyData(analyser)
        const step = Math.floor(data.length / BAR_COUNT)
        const next = Array.from({ length: BAR_COUNT }, (_, i) => {
          const idx = i * step
          const v = data[idx] ?? 0
          return Math.min(100, (v / 255) * 100)
        })
        setLevels(next)
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    })
    return () => {
      mounted = false
      cancelAnimationFrame(rafRef.current)
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [active])

  return (
    <div className="audio-visualiser glass">
      <div className="audio-visualiser-bars">
        {levels.map((pct, i) => (
          <div
            key={i}
            className="audio-visualiser-bar"
            style={{
              height: active ? `${Math.max(2, (pct / 100) * MAX_HEIGHT)}px` : '2px',
            }}
          />
        ))}
      </div>
    </div>
  )
}
