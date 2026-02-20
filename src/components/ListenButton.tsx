type ListenButtonProps = {
  listening: boolean
  onToggle: () => void
  supported: boolean
}

export function ListenButton({ listening, onToggle, supported }: ListenButtonProps) {
  return (
    <button
      type="button"
      className={`listen-button ${listening ? 'listening' : ''}`}
      onClick={onToggle}
      disabled={!supported}
      aria-pressed={listening}
    >
      {listening ? 'Escuchando…' : 'Escuchar'}
    </button>
  )
}
