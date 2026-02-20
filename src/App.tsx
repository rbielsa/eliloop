import { useReducer, useState, useEffect, useCallback, useRef } from 'react'
import { sessionReducer, initialSessionState } from './store/sessionStore'
import type { Project, Part } from './types'
import { initDB, getProjectById, getAllProjects } from './store/projectStore'
import { speak } from './services/speechSynthesis'
import * as voiceService from './services/voiceService'
import { processCommand } from './services/commandInterpreter'
import { ProjectHeader } from './components/ProjectHeader'
import { ProjectList } from './components/ProjectList'
import { RowDisplay } from './components/RowDisplay'
import { HistoryList } from './components/HistoryList'
import { ListenButton } from './components/ListenButton'
import { StatusBar } from './components/StatusBar'
import './App.css'

export default function App() {
  const [session, dispatch] = useReducer(sessionReducer, initialSessionState)
  const [project, setProject] = useState<Project | null>(null)
  const [part, setPart] = useState<Part | null>(null)
  const [ready, setReady] = useState(false)
  const [lastHeard, setLastHeard] = useState<string>('')
  const [allProjects, setAllProjects] = useState<Project[]>([])

  const projectRef = useRef(project)
  const partRef = useRef(part)
  const sessionRef = useRef(session)
  projectRef.current = project
  partRef.current = part
  sessionRef.current = session

  const loadProjects = useCallback(async () => {
    const projects = await getAllProjects()
    setAllProjects(projects)
  }, [])

  useEffect(() => {
    initDB().then(() => {
      loadProjects()
      setReady(true)
    })
  }, [loadProjects])

  useEffect(() => {
    if (!session.activeProjectId) {
      setProject(null)
      setPart(null)
      return
    }
    getProjectById(session.activeProjectId).then((p) => {
      setProject(p ?? null)
      if (p && session.activePartId) {
        const found = p.parts.find((pa) => pa.id === session.activePartId) ?? null
        setPart(found)
      } else {
        setPart(null)
      }
    })
  }, [session.activeProjectId, session.activePartId])

  useEffect(() => {
    if (session.conversationState === 'idle' && !session.activeProjectId) {
      loadProjects()
    }
  }, [session.conversationState, session.activeProjectId, loadProjects])

  const startListeningContinuous = useCallback(() => {
    setLastHeard('')
    dispatch({ type: 'SET_LISTENING', payload: true })
    voiceService.startListening(
      (text) => handleResult(text),
      () => dispatch({ type: 'SET_LISTENING', payload: false })
    )
  }, [])

  const handleResult = useCallback(
    async (text: string) => {
      setLastHeard(text)
      const s = sessionRef.current
      const p = projectRef.current
      const pa = partRef.current
      const result = await processCommand(text, s, p, pa, dispatch)
      setProject(result.project)
      setPart(result.part)
      if (!result.project && !result.part) {
        voiceService.stopListening()
        dispatch({ type: 'SET_LISTENING', payload: false })
        loadProjects()
      }
    },
    [loadProjects]
  )

  const handleListenToggle = useCallback(() => {
    if (sessionRef.current.listening) {
      voiceService.stopListening()
      dispatch({ type: 'SET_LISTENING', payload: false })
    } else {
      startListeningContinuous()
    }
  }, [startListeningContinuous])

  const handleSelectPart = useCallback((proj: Project, partId: string) => {
    const selectedPart = proj.parts.find((p) => p.id === partId)
    if (!selectedPart) return

    setProject(proj)
    setPart(selectedPart)
    dispatch({ type: 'SET_PROJECT', payload: proj.id })
    dispatch({ type: 'SET_PART', payload: partId })
    dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'tracking' })
    speak(`Ok. Vas por vuelta ${selectedPart.currentRow}`)
    startListeningContinuous()
  }, [startListeningContinuous])

  if (!ready) {
    return (
      <div className="app">
        <p className="loading">Cargando…</p>
      </div>
    )
  }

  const isIdle = session.conversationState === 'idle' && !project

  return (
    <div className="app">
      <ProjectHeader projectName={project?.name ?? null} partName={part?.name ?? null} />

      {isIdle ? (
        <main className="main">
          <ProjectList projects={allProjects} onSelectPart={handleSelectPart} />
        </main>
      ) : (
        <main className="main">
          <RowDisplay currentRow={part?.currentRow ?? 0} />
          <HistoryList entries={part?.history ?? []} />
        </main>
      )}

      <StatusBar listening={session.listening} conversationState={session.conversationState} />
      {lastHeard && (
        <p className="last-heard" aria-live="polite">
          Has dicho: <strong>"{lastHeard}"</strong>
        </p>
      )}
      <ListenButton
        listening={session.listening}
        onToggle={handleListenToggle}
        supported={voiceService.isSupported()}
      />
    </div>
  )
}
