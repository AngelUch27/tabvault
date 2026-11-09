import * as alphaTab from '@coderline/alphatab'
import type { Instrument } from './types'

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`

export const FONT_DIRECTORY = `${base}font/`
export const SOUNDFONT_URL = `${base}soundfont/sonivox.sf3`

function baseSettings(): alphaTab.Settings {
  const settings = new alphaTab.Settings()
  settings.core.fontDirectory = FONT_DIRECTORY
  settings.core.logLevel = alphaTab.LogLevel.Warning
  return settings
}

export interface ScoreMeta {
  title: string
  artist: string
  tempo: number
  tracks: { index: number; name: string; isPercussion: boolean; tuning: string }[]
  barCount: number
}

/** Analiza alphaTex sin renderizar. Lanza si hay errores de sintaxis. */
export function parseTex(tex: string): alphaTab.model.Score {
  return alphaTab.importer.ScoreLoader.loadAlphaTex(tex, baseSettings())
}

export function scoreMeta(score: alphaTab.model.Score): ScoreMeta {
  return {
    title: score.title,
    artist: score.artist,
    tempo: score.tempo,
    barCount: score.masterBars.length,
    tracks: score.tracks.map((t) => ({
      index: t.index,
      name: t.name,
      isPercussion: t.staves.some((s) => s.isPercussion),
      tuning: t.staves[0]?.tuning?.length
        ? t.staves[0].tuning.map((v) => alphaTab.model.Tuning.getTextForTuning(v, false)).join(' ')
        : '',
    })),
  }
}

/** Convierte un archivo (Guitar Pro 3-8, MusicXML, CapXML) a alphaTex. */
export function fileToTex(bytes: Uint8Array): { tex: string; score: alphaTab.model.Score } {
  const settings = baseSettings()
  const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(bytes, settings)
  const exporter = new alphaTab.exporter.AlphaTexExporter()
  const tex = exporter.exportToString(score, settings)
  return { tex, score }
}

export function guessInstrument(score: alphaTab.model.Score): Instrument {
  if (score.tracks.length > 1) return 'multi'
  const track = score.tracks[0]
  if (!track) return 'other'
  if (track.staves.some((s) => s.isPercussion)) return 'drums'
  const program = track.playbackInfo.program
  if (program >= 32 && program <= 39) return 'bass'
  if (program >= 24 && program <= 31) return 'guitar'
  const strings = track.staves[0]?.tuning?.length ?? 0
  if (strings === 4 || strings === 5) return 'bass'
  if (strings >= 6) return 'guitar'
  return 'other'
}

export function texErrorMessage(err: unknown): string {
  // alphaTab envuelve el error de sintaxis en UnsupportedFormatError; el detalle está en cause
  if (err instanceof Error && err.cause instanceof alphaTab.importer.AlphaTexErrorWithDiagnostics) err = err.cause
  if (err instanceof alphaTab.importer.AlphaTexErrorWithDiagnostics) {
    const diags = [...err.iterateDiagnostics()]
      .filter((d) => d.severity === alphaTab.importer.alphaTex.AlphaTexDiagnosticsSeverity.Error)
      .slice(0, 5)
      .map((d) => `Línea ${d.start?.line ?? "?"}, col ${d.start?.col ?? "?"}: ${d.message}`)
    return diags.length ? diags.join('\n') : err.message
  }
  if (err instanceof Error) return err.message
  return String(err)
}
