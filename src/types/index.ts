export type Project = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  parts: Part[]
}

export type Part = {
  id: string
  name: string
  currentRow: number
  history: RowEntry[]
}

export type RowEntry = {
  rowNumber: number
  timestamp: string
}

export type ConversationState =
  | 'idle'
  | 'awaitingProject'
  | 'awaitingPart'
  | 'tracking'

export type SessionState = {
  activeProjectId: string | null
  activePartId: string | null
  listening: boolean
  conversationState: ConversationState
}
