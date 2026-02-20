import type { SessionState, ConversationState } from '../types'

export type SessionAction =
  | { type: 'SET_PROJECT'; payload: string | null }
  | { type: 'SET_PART'; payload: string | null }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_CONVERSATION_STATE'; payload: ConversationState }
  | { type: 'RESET' }

const initialState: SessionState = {
  activeProjectId: null,
  activePartId: null,
  listening: false,
  conversationState: 'idle',
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, activeProjectId: action.payload }
    case 'SET_PART':
      return { ...state, activePartId: action.payload }
    case 'SET_LISTENING':
      return { ...state, listening: action.payload }
    case 'SET_CONVERSATION_STATE':
      return { ...state, conversationState: action.payload }
    case 'RESET':
      return {
        ...initialState,
        listening: state.listening,
      }
    default:
      return state
  }
}

export { initialState as initialSessionState }
