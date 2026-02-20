export type AnalyserCleanup = () => void

export async function startAnalyser(): Promise<{
  analyser: AnalyserNode
  cleanup: AnalyserCleanup
} | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.6
    source.connect(analyser)
    const cleanup = () => {
      stream.getTracks().forEach((t) => t.stop())
      ctx.close()
    }
    return { analyser, cleanup }
  } catch {
    return null
  }
}

export function getFrequencyData(analyser: AnalyserNode): Uint8Array {
  const data = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteFrequencyData(data)
  return data
}
