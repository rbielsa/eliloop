export function speak(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  window.speechSynthesis.speak(utterance)
}
