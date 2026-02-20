import { normalizeText } from '../utils/normalizeText'
import { speak } from './speechSynthesis'
import type { SessionState, Project, Part } from '../types'
import type { SessionAction } from '../store/sessionStore'
import {
  getProjectByName,
  createProject,
  updateProject,
  createPart,
  appendRowEntry,
  persistPartChanges,
} from '../store/projectStore'

export type ProcessCommandResult = {
  project: Project | null
  part: Part | null
  sessionActions: SessionAction[]
}

export async function processCommand(
  text: string,
  session: SessionState,
  currentProject: Project | null,
  currentPart: Part | null,
  dispatch: (action: SessionAction) => void
): Promise<{ project: Project | null; part: Part | null }> {
  const normalized = normalizeText(text)
  if (!normalized) return { project: currentProject, part: currentPart }

  const state = session.conversationState

  if (state === 'idle') {
    const wakeWord = normalized.replace(/\s/g, '')
    const onlyEliLoop = wakeWord === 'eliloop' || normalized === 'el hilo'
    const eliloopWithName =
      /^eli\s*loop\s+(.+)$/.exec(normalized) ??
      /^eliloop\s+(.+)$/.exec(normalized) ??
      /^el hilo\s+(.+)$/.exec(normalized)
    if (onlyEliLoop) {
      speak('Ok. ¿Qué proyecto?')
      dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'awaitingProject' })
      return { project: currentProject, part: currentPart }
    }
    if (eliloopWithName) {
      const projectName = eliloopWithName[1].replace(/\s+/g, ' ').trim()
      let project = await getProjectByName(projectName)
      if (!project) {
        project = await createProject(projectName)
      }
      speak('Ok. ¿Qué parte?')
      dispatch({ type: 'SET_PROJECT', payload: project.id })
      dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'awaitingPart' })
      return { project, part: null }
    }
    return { project: currentProject, part: currentPart }
  }

  if (state === 'awaitingProject') {
    const projectName = normalized.trim()
    let project = await getProjectByName(projectName)
    if (!project) {
      project = await createProject(projectName)
    }
    speak('Ok. ¿Qué parte?')
    dispatch({ type: 'SET_PROJECT', payload: project.id })
    dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'awaitingPart' })
    return { project, part: null }
  }

  if (state === 'awaitingPart' && currentProject) {
    const partName = normalized.trim()
    let part = currentProject.parts.find((p) => normalizeText(p.name) === normalizeText(partName))
    if (!part) {
      part = createPart(partName)
      currentProject.parts = [...currentProject.parts, part]
      await updateProject(currentProject)
    }
    speak(`Ok. Vas por vuelta ${part.currentRow}`)
    dispatch({ type: 'SET_PART', payload: part.id })
    dispatch({ type: 'SET_CONVERSATION_STATE', payload: 'tracking' })
    return { project: currentProject, part }
  }

  if (state === 'tracking' && currentProject && currentPart) {
    let newRow = currentPart.currentRow
    let updated = false

    if (/^mas uno$/.test(normalized)) {
      newRow = currentPart.currentRow + 1
      updated = true
    } else if (/^mas dos$/.test(normalized)) {
      newRow = currentPart.currentRow + 2
      updated = true
    } else if (/^k$/.test(normalized)) {
      newRow = currentPart.currentRow + 1
      updated = true
    } else {
      const kNum = /^k(\d+)$/.exec(normalized)
      if (kNum) {
        newRow = parseInt(kNum[1], 10)
        updated = true
      } else {
        const volver = /^volver a (\d+)$/.exec(normalized)
        if (volver) {
          newRow = parseInt(volver[1], 10)
          updated = true
        }
      }
    }

    if (/^por donde voy/.test(normalized)) {
      speak(`Vuelta ${currentPart.currentRow}`)
      return { project: currentProject, part: currentPart }
    }

    if (/^lo dejo$/.test(normalized)) {
      await persistPartChanges(currentProject, currentPart)
      speak('Ok. Guardado.')
      dispatch({ type: 'RESET' })
      return { project: null, part: null }
    }

    if (updated) {
      const partUpdated = appendRowEntry(currentPart, newRow)
      await persistPartChanges(currentProject, partUpdated)
      speak(`Ok. ${newRow}`)
      return { project: currentProject, part: partUpdated }
    }
  }

  return { project: currentProject, part: currentPart }
}
