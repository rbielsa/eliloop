export function playTone(frequencyHz: number, durationMs: number): void {
  if (typeof window === 'undefined' || !(window as unknown as { AudioContext?: typeof AudioContext }).AudioContext) return
  try {
    const ctx = new window.AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequencyHz
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + durationMs / 1000)
  } catch {
    // ignore
  }
}

export function vibrate(ms: number): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(ms)
    } catch {
      // ignore
    }
  }
}
