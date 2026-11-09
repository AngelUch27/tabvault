import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { SAMPLE_SONGS } from './samples'
import { INSTRUMENT_ORDER, type BackupFile, type Instrument, type Song } from './types'

/**
 * Storage layer. Today it uses IndexedDB (local to the browser, free, no server).
 * To sync across devices, implement this same interface on top of Supabase or
 * another backend and swap `store` at the bottom of this file.
 */
export interface SongStore {
  list(): Promise<Song[]>
  get(id: string): Promise<Song | undefined>
  save(song: Song): Promise<void>
  remove(id: string): Promise<void>
  clear(): Promise<void>
}

interface TabVaultDB extends DBSchema {
  tabs: {
    key: string
    value: Song
    indexes: { 'by-updated': string }
  }
}

/** Older records stored a single `instrument`; normalise them to `instruments[]`. */
function normalise(raw: unknown): Song | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Partial<Song> & { instrument?: string }
  if (typeof r.tex !== 'string' || typeof r.id !== 'string') return undefined
  let instruments: Instrument[] = Array.isArray(r.instruments)
    ? r.instruments.filter((i): i is Instrument => INSTRUMENT_ORDER.includes(i as Instrument))
    : []
  if (!instruments.length && r.instrument) {
    const legacy = r.instrument === 'multi' ? ['guitar', 'bass', 'drums'] : [r.instrument]
    instruments = legacy.filter((i): i is Instrument => INSTRUMENT_ORDER.includes(i as Instrument))
  }
  const now = new Date().toISOString()
  return {
    id: r.id,
    title: r.title ?? '',
    artist: r.artist ?? '',
    instruments,
    tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string') : [],
    tex: r.tex,
    tempo: typeof r.tempo === 'number' ? r.tempo : null,
    notes: r.notes ?? '',
    createdAt: r.createdAt ?? now,
    updatedAt: r.updatedAt ?? now,
  }
}

class IndexedDbStore implements SongStore {
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
    return all
      .reverse()
      .map(normalise)
      .filter((s): s is Song => !!s)
  }

  async get(id: string) {
    const db = await this.dbPromise
    return normalise(await db.get('tabs', id))
  }

  async save(song: Song) {
    const db = await this.dbPromise
    await db.put('tabs', song)
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

export const store: SongStore = new IndexedDbStore()

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function emptySong(): Song {
  const now = new Date().toISOString()
  return {
    id: newId(),
    title: '',
    artist: '',
    instruments: [],
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
    version: 2,
    exportedAt: new Date().toISOString(),
    songs: await store.list(),
  }
}

export async function importBackup(json: unknown): Promise<number> {
  if (!json || typeof json !== 'object') throw new Error('Not a valid file')
  const data = json as Partial<BackupFile> & { tabs?: unknown[] }
  const items = Array.isArray(data.songs) ? data.songs : Array.isArray(data.tabs) ? data.tabs : null
  if (data.app !== 'tabvault' || !items) {
    throw new Error('This file is not a TabVault backup')
  }
  let count = 0
  for (const raw of items) {
    const song = normalise(raw)
    if (!song) continue
    await store.save(song)
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

const SEED_KEY = 'tabvault.seeded.v2'
let seeding: Promise<void> | null = null

/** First launch in a browser: load the example songs. */
export function ensureSeeded(): Promise<void> {
  if (!seeding) {
    seeding = (async () => {
      let done = false
      try {
        done = !!localStorage.getItem(SEED_KEY)
      } catch {
        done = false
      }
      if (done) return
      const existing = await store.list()
      // Replace the old per-instrument examples with the new multi-track ones
      for (const legacyId of ['sample-guitar', 'sample-bass', 'sample-drums', 'sample-band']) {
        if (existing.some((s) => s.id === legacyId)) await store.remove(legacyId)
      }
      const remaining = existing.filter((s) => !s.id.startsWith('sample-'))
      if (remaining.length === 0) {
        for (const sample of SAMPLE_SONGS) await store.save(sample)
      }
      try {
        localStorage.setItem(SEED_KEY, '1')
      } catch {
        // no localStorage: the empty-list check above still prevents duplicates
      }
    })()
  }
  return seeding
}
