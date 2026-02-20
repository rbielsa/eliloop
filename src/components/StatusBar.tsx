import type { ConversationState } from '../types'

type StatusBarProps = {
  listening: boolean
  conversationState: ConversationState
}

const stateLabels: Record<ConversationState, string> = {
  idle: 'En espera',
  awaitingProject: 'Di el proyecto',
  awaitingPart: 'Di la parte',
  tracking: 'Contando',
}

export function StatusBar({ listening, conversationState }: StatusBarProps) {
  return (
    <div className="status-bar glass">
      {listening && <span className="status-dot" aria-hidden />}
      <span className="status-text">{stateLabels[conversationState]}</span>
    </div>
  )
}
