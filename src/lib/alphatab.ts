import * as alphaTab from '@coderline/alphatab'
import { INSTRUMENT_ORDER, type Instrument } from './types'

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`

export const FONT_DIRECTORY = `${base}font/`
export const SOUNDFONT_URL = `${base}soundfont/sonivox.sf3`

function baseSettings(): alphaTab.Settings {
  const settings = new alphaTab.Settings()
  settings.core.fontDirectory = FONT_DIRECTORY
  settings.core.logLevel = alphaTab.LogLevel.Warning
  return settings
}

/** Parses alphaTex without rendering. Throws on syntax errors. */
export function parseTex(tex: string): alphaTab.model.Score {
  return alphaTab.importer.ScoreLoader.loadAlphaTex(tex, baseSettings())
}

/** Converts a file (Guitar Pro 3-8, MusicXML, CapXML) into alphaTex. */
export function fileToTex(bytes: Uint8Array): { tex: string; score: alphaTab.model.Score } {
  const settings = baseSettings()
  const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(bytes, settings)
  const exporter = new alphaTab.exporter.AlphaTexExporter()
  const tex = exporter.exportToString(score, settings)
  return { tex, score }
}

/** Classifies a single track by its MIDI program / tuning. */
export function trackInstrument(track: alphaTab.model.Track): Instrument {
  if (track.staves.some((s) => s.isPercussion)) return 'drums'
  const program = track.playbackInfo.program
  if (program >= 32 && program <= 39) return 'bass'
  if (program >= 24 && program <= 31) return 'guitar'
  const strings = track.staves[0]?.tuning?.length ?? 0
  if (strings === 4 || strings === 5) return 'bass'
  if (strings >= 6) return 'guitar'
  return 'other'
}

/** Distinct instruments in a score, in display order. */
export function scoreInstruments(score: alphaTab.model.Score): Instrument[] {
  const set = new Set(score.tracks.map(trackInstrument))
  return INSTRUMENT_ORDER.filter((i) => set.has(i))
}

export function texErrorMessage(err: unknown): string {
  // alphaTab wraps syntax errors in UnsupportedFormatError; the details live in `cause`
  if (err instanceof Error && err.cause instanceof alphaTab.importer.AlphaTexErrorWithDiagnostics) err = err.cause
  if (err instanceof alphaTab.importer.AlphaTexErrorWithDiagnostics) {
    const diags = [...err.iterateDiagnostics()]
      .filter((d) => d.severity === alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Error)
      .slice(0, 5)
      .map((d) => `Line ${d.start?.line ?? '?'}, col ${d.start?.col ?? '?'}: ${d.message}`)
    return diags.length ? diags.join('\n') : err.message
  }
  if (err instanceof Error) return err.message
  return String(err)
}
