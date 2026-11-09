export type Instrument = 'guitar' | 'bass' | 'drums' | 'multi' | 'other'

export interface Tab {
  id: string
  title: string
  artist: string
  instrument: Instrument
  tags: string[]
  /** Contenido en formato alphaTex. Es la única fuente de verdad de la partitura. */
  tex: string
  tempo: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  guitar: 'Guitarra',
  bass: 'Bajo',
  drums: 'Batería',
  multi: 'Varios',
  other: 'Otro',
}

export interface BackupFile {
  app: 'tabvault'
  version: 1
  exportedAt: string
  tabs: Tab[]
}
