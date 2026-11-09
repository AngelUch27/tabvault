import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BackupFile, Tab } from './types'

/**
 * Capa de almacenamiento. Hoy usa IndexedDB (local al navegador, gratis, sin servidor).
 * Cuando se quiera compartir entre dispositivos basta con implementar esta misma
 * interfaz sobre Supabase u otro backend y cambiar `store` al final del archivo.
 */
export interface TabStore {
  list(): Promise<Tab[]>
  get(id: string): Promise<Tab | undefined>
  save(tab: Tab): Promise<void>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}

interface TabVaultDB extends DBSchema {
  tabs: {
    key: string
    value: Tab
    indexes: { 'by-updated': string }
  }
}

class IndexedDbStore implements TabStore {
  private dbPromise: Promise<IDBPDatabase<TabVaultDB>>

  constructor() {
    this.dbPromise = openDB<TabVaultDB>('tabvault', 1, {
      upgrade(db) {
        const store = db.createObjectStore('tabs', { keyPath: 'id' })
        store.createIndex('by-updated', 'updatedAt')
      },
    })
  }

  async list() {
    const db = await this.dbPromise
    const all = await db.getAllFromIndex('tabs', 'by-updated')
    return all.reverse()
  }

  async get(id: string) {
    const db = await this.dbPromise
    return db.get('tabs', id)
  }

  async save(tab: Tab) {
    const db = await this.dbPromise
    await db.put('tabs', tab)
  }

  async remove(id: string) {
    const db = await this.dbPromise
    await db.delete('tabs', id)
  }

  async clear() {
    const db = await this.dbPromise
    await db.clear('tabs')
  }
}

export const store: TabStore = new IndexedDbStore()

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function emptyTab(): Tab {
  const now = new Date().toISOString()
  return {
    id: newId(),
    title: '',
    artist: '',
    instrument: 'guitar',
    tags: [],
    tex: '',
    tempo: null,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

export async function exportBackup(): Promise<BackupFile> {
  return {
    app: 'tabvault',
    version: 1,
    exportedAt: new Date().toISOString(),
    tabs: await store.list(),
  }
}

export async function importBackup(json: unknown): Promise<number> {
  if (!json || typeof json !== 'object') throw new Error('Archivo no válido')
  const data = json as Partial<BackupFile>
  if (data.app !== 'tabvault' || !Array.isArray(data.tabs)) {
    throw new Error('Este archivo no es una copia de seguridad de TabVault')
  }
  let count = 0
  for (const raw of data.tabs) {
    if (!raw || typeof raw !== 'object' || typeof (raw as Tab).tex !== 'string') continue
    const base = emptyTab()
    const tab: Tab = {
      ...base,
      ...raw,
      id: typeof raw.id === 'string' && raw.id ? raw.id : base.id,
      tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === 'string') : [],
    }
    await store.save(tab)
    count++
  }
  return count
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
