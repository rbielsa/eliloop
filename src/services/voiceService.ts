const SpeechRecognitionAPI =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

let recognition: SpeechRecognition | null = null
let keepAlive = false

export function isSupported(): boolean {
  return Boolean(SpeechRecognitionAPI)
}

function getTranscript(event: SpeechRecognitionEvent): string {
  const results = event.results
  if (!results?.length) return ''
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].isFinal) {
      return results[i][0]?.transcript?.trim() ?? ''
    }
  }
  const last = results[results.length - 1]
  return last?.[0]?.transcript?.trim() ?? ''
}

function createRecognition(
  onResult: (text: string) => void,
  onStopped: () => void,
): SpeechRecognition {
  const rec = new (SpeechRecognitionAPI as { new (): SpeechRecognition })()
  rec.lang = 'es-ES'
  rec.continuous = true
  rec.interimResults = false

  rec.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = getTranscript(event)
    if (transcript) onResult(transcript)
  }

  rec.onend = () => {
    if (keepAlive) {
      setTimeout(() => restart(onResult, onStopped), 300)
    } else {
      recognition = null
      onStopped()
    }
  }

  rec.onerror = () => {
    if (keepAlive) {
      setTimeout(() => restart(onResult, onStopped), 500)
    } else {
      recognition = null
      onStopped()
    }
  }

  return rec
}

function restart(
  onResult: (text: string) => void,
  onStopped: () => void,
): void {
  if (!keepAlive || !SpeechRecognitionAPI) {
    onStopped()
    return
  }
  try {
    recognition = createRecognition(onResult, onStopped)
    recognition.start()
  } catch {
    onStopped()
  }
}

export function startListening(
  onResult: (text: string) => void,
  onStopped: () => void,
): void {
  if (!SpeechRecognitionAPI) return
  keepAlive = true
  try {
    recognition = createRecognition(onResult, onStopped)
    recognition.start()
  } catch {
    keepAlive = false
    onStopped()
  }
}

export function stopListening(): void {
  keepAlive = false
  if (recognition) {
    try {
      recognition.stop()
    } catch {
      // ignore
    }
    recognition = null
  }
}
