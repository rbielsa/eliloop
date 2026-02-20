import { openDB, type IDBPDatabase } from 'idb'
import type { Project, Part, RowEntry } from '../types'
import { normalizeText } from '../utils/normalizeText'

const DB_NAME = 'eliloop-db'
const STORE_NAME = 'projects'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<{ projects: Project }>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<{ projects: Project }>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('byName', 'name')
      },
    })
  }
  return dbPromise
}

export async function initDB(): Promise<void> {
  await getDB()
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export async function createProject(name: string): Promise<Project> {
  const db = await getDB()
  const now = new Date().toISOString()
  const project: Project = {
    id: generateId(),
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
    parts: [],
  }
  await db.put(STORE_NAME, project)
  return project
}

function normalizePart(part: Part & { repeatEvery?: number | null }): Part {
  return { ...part, repeatEvery: part.repeatEvery ?? null }
}

function normalizeProject(p: Project): Project {
  return { ...p, parts: p.parts.map(normalizePart) }
}

export async function getProjectByName(name: string): Promise<Project | undefined> {
  const db = await getDB()
  const normalized = normalizeText(name)
  const all = await db.getAll(STORE_NAME)
  const found = all.find((p) => normalizeText(p.name) === normalized)
  return found ? normalizeProject(found) : undefined
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const db = await getDB()
  const p = await db.get(STORE_NAME, id)
  return p ? normalizeProject(p) : undefined
}

export async function updateProject(project: Project): Promise<void> {
  const db = await getDB()
  project.updatedAt = new Date().toISOString()
  await db.put(STORE_NAME, project)
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  return all.map(normalizeProject)
}

export function createPart(name: string): Part {
  return {
    id: generateId(),
    name: name.trim(),
    currentRow: 0,
    repeatEvery: null,
    history: [],
  }
}

export function appendRowEntry(part: Part, rowNumber: number): Part {
  const entry: RowEntry = {
    rowNumber,
    timestamp: new Date().toISOString(),
  }
  return {
    ...part,
    currentRow: rowNumber,
    history: [...part.history, entry],
  }
}

export async function persistPartChanges(project: Project, part: Part): Promise<void> {
  const updatedParts = project.parts.map((p) => (p.id === part.id ? part : p))
  const projectUpdated: Project = {
    ...project,
    parts: updatedParts,
    updatedAt: new Date().toISOString(),
  }
  await updateProject(projectUpdated)
}

export async function deletePartFromProject(project: Project, partId: string): Promise<Project> {
  const parts = project.parts.filter((p) => p.id !== partId)
  const projectUpdated: Project = {
    ...project,
    parts,
    updatedAt: new Date().toISOString(),
  }
  await updateProject(projectUpdated)
  return projectUpdated
}
