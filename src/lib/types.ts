export type Instrument = 'guitar' | 'bass' | 'drums' | 'other'

/**
 * A song. One song can hold several tracks (guitar, bass, drums…) inside the
 * same alphaTex source; the player lets you pick which one to look at.
 */
export interface Song {
  id: string
  title: string
  artist: string
  /** Instruments present in the tracks, derived from the alphaTex when saving. */
  instruments: Instrument[]
  tags: string[]
  /** alphaTex source. This is the single source of truth for the score. */
  tex: string
  tempo: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  guitar: 'Guitar',
  bass: 'Bass',
  drums: 'Drums',
  other: 'Other',
}

export const INSTRUMENT_ORDER: Instrument[] = ['guitar', 'bass', 'drums', 'other']

export interface BackupFile {
  app: 'tabvault'
  version: 2
  exportedAt: string
  songs: Song[]
}
