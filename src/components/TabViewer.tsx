import { useCallback, useEffect, useRef, useState } from 'react'
import * as alphaTab from '@coderline/alphatab'
import { FONT_DIRECTORY, SOUNDFONT_URL, parseTex } from '../lib/alphatab'

interface TrackState {
  index: number
  name: string
  isPercussion: boolean
  mute: boolean
  solo: boolean
  visible: boolean
}

interface Props {
  tex: string
  compact?: boolean
  onError?: (message: string | null) => void
}

const SPEEDS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.5]
const ZOOMS = [0.6, 0.75, 0.9, 1, 1.25, 1.5]

function fmt(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function color(hex: string) {
  return alphaTab.model.Color.fromJson(hex)!
}

export default function TabViewer({ tex, compact = false, onError }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null)
  const posRef = useRef<HTMLSpanElement>(null)
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const [ready, setReady] = useState(false)
  const [rendering, setRendering] = useState(true)
  const [sfProgress, setSfProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(false)
  const [metronome, setMetronome] = useState(false)
  const [countIn, setCountIn] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [horizontal, setHorizontal] = useState(false)
  const [tracks, setTracks] = useState<TrackState[]>([])
  const [showTracks, setShowTracks] = useState(false)
  const [endTime, setEndTime] = useState(0)

  // Crear la instancia de alphaTab una sola vez
  useEffect(() => {
    const main = mainRef.current
    const scroll = scrollRef.current
    if (!main || !scroll) return

    const settings = new alphaTab.Settings()
    settings.core.fontDirectory = FONT_DIRECTORY
    settings.core.logLevel = alphaTab.LogLevel.Warning
    settings.core.tracks = 'all'
    settings.player.playerMode = alphaTab.PlayerMode.EnabledSynthesizer
    settings.player.soundFont = SOUNDFONT_URL
    settings.player.scrollElement = scroll
    settings.player.scrollMode = alphaTab.ScrollMode.Continuous
    settings.player.scrollOffsetY = -40
    settings.player.enableCursor = true
    settings.player.enableAnimatedBeatCursor = true
    settings.player.enableElementHighlighting = true
    settings.display.layoutMode = alphaTab.LayoutMode.Page
    settings.display.scale = 1
    settings.display.resources.mainGlyphColor = color('#1b1d23')
    settings.display.resources.secondaryGlyphColor = color('#4a4f5c')
    settings.display.resources.staffLineColor = color('#8d93a1')
    settings.display.resources.barSeparatorColor = color('#1b1d23')
    settings.display.resources.barNumberColor = color('#b4542a')
    settings.display.resources.scoreInfoColor = color('#1b1d23')

    const api = new alphaTab.AlphaTabApi(main, settings)
    apiRef.current = api

    api.renderStarted.on(() => setRendering(true))
    api.renderFinished.on(() => setRendering(false))
    api.scoreLoaded.on((score) => {
      onErrorRef.current?.(null)
      setTracks(
        score.tracks.map((t) => ({
          index: t.index,
          name: t.name || `Pista ${t.index + 1}`,
          isPercussion: t.staves.some((s) => s.isPercussion),
          mute: false,
          solo: false,
          visible: true,
        })),
      )
    })
    api.soundFontLoad.on((e) => setSfProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 0))
    api.playerReady.on(() => setReady(true))
    api.playerStateChanged.on((e) => setPlaying(e.state === alphaTab.synth.PlayerState.Playing))
    api.playerPositionChanged.on((e) => {
      if (posRef.current) posRef.current.textContent = fmt(e.currentTime)
      setEndTime((prev) => (prev === e.endTime ? prev : e.endTime))
    })
    api.error.on((err) => {
      setRendering(false)
      onErrorRef.current?.(err.message ?? String(err))
    })

    return () => {
      api.destroy()
      apiRef.current = null
    }
  }, [])

  // Cargar/actualizar la partitura cuando cambia el texto
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    if (!tex.trim()) return
    try {
      // Se analiza aquí para poder mostrar todas las pistas (alphaTab solo dibuja la primera por defecto)
      const score = parseTex(tex)
      api.renderScore(score, score.tracks.map((_, i) => i))
    } catch (err) {
      onErrorRef.current?.(err instanceof Error ? err.message : String(err))
    }
  }, [tex])

  const applySettings = useCallback(() => {
    const api = apiRef.current
    if (!api) return
    api.updateSettings()
    api.render()
  }, [])

  const changeZoom = (value: number) => {
    setZoom(value)
    const api = apiRef.current
    if (!api) return
    api.settings.display.scale = value
    applySettings()
  }

  const changeLayout = (h: boolean) => {
    setHorizontal(h)
    const api = apiRef.current
    if (!api) return
    api.settings.display.layoutMode = h ? alphaTab.LayoutMode.Horizontal : alphaTab.LayoutMode.Page
    applySettings()
  }

  const changeAutoScroll = (on: boolean) => {
    setAutoScroll(on)
    const api = apiRef.current
    if (!api) return
    api.settings.player.scrollMode = on ? alphaTab.ScrollMode.Continuous : alphaTab.ScrollMode.Off
    api.updateSettings()
  }

  const changeSpeed = (value: number) => {
    setSpeed(value)
    if (apiRef.current) apiRef.current.playbackSpeed = value
  }
  const toggleLoop = () => {
    const next = !loop
    setLoop(next)
    if (apiRef.current) apiRef.current.isLooping = next
  }
  const toggleMetronome = () => {
    const next = !metronome
    setMetronome(next)
    if (apiRef.current) apiRef.current.metronomeVolume = next ? 1 : 0
  }
  const toggleCountIn = () => {
    const next = !countIn
    setCountIn(next)
    if (apiRef.current) apiRef.current.countInVolume = next ? 1 : 0
  }

  const updateTrack = (index: number, patch: Partial<TrackState>) => {
    const api = apiRef.current
    const next = tracks.map((t) => (t.index === index ? { ...t, ...patch } : t))
    setTracks(next)
    if (!api?.score) return
    const score = api.score
    const model = score.tracks[index]
    if (model) {
      if (patch.mute !== undefined) api.changeTrackMute([model], patch.mute)
      if (patch.solo !== undefined) api.changeTrackSolo([model], patch.solo)
    }
    if (patch.visible !== undefined) {
      const visible = next.filter((t) => t.visible).map((t) => score.tracks[t.index])
      if (visible.length) api.renderTracks(visible)
    }
  }

  return (
    <div className={`viewer ${compact ? 'viewer--compact' : ''}`}>
      <div className="viewer__scroll" ref={scrollRef}>
        {rendering && <div className="viewer__overlay">Dibujando partitura…</div>}
        <div className="viewer__paper">
          <div ref={mainRef} className="at-main" />
        </div>
      </div>

      <div className="controls">
        <div className="controls__row">
          <button
            className={`btn btn--icon ${playing ? 'btn--active' : 'btn--primary'}`}
            onClick={() => apiRef.current?.playPause()}
            disabled={!ready}
            title={ready ? (playing ? 'Pausar' : 'Reproducir') : `Cargando sonidos… ${sfProgress}%`}
            aria-label={playing ? 'Pausar' : 'Reproducir'}
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button
            className="btn btn--icon"
            onClick={() => apiRef.current?.stop()}
            disabled={!ready}
            title="Detener"
            aria-label="Detener"
          >
            ■
          </button>
          <span className="controls__time">
            <span ref={posRef}>0:00</span> / {fmt(endTime)}
          </span>
          {!ready && <span className="controls__loading">Sonidos {sfProgress}%</span>}

          <label className="controls__field">
            <span>Velocidad</span>
            <select value={speed} onChange={(e) => changeSpeed(Number(e.target.value))}>
              {SPEEDS.map((s) => (
                <option key={s} value={s}>
                  {Math.round(s * 100)}%
                </option>
              ))}
            </select>
          </label>

          <button className={`btn ${loop ? 'btn--active' : ''}`} onClick={toggleLoop} title="Repetir en bucle">
            ⟲ Bucle
          </button>
          <button className={`btn ${metronome ? 'btn--active' : ''}`} onClick={toggleMetronome} title="Metrónomo">
            ♩ Metro
          </button>
          <button className={`btn ${countIn ? 'btn--active' : ''}`} onClick={toggleCountIn} title="Cuenta de entrada">
            1·2·3·4
          </button>
          <button
            className={`btn ${autoScroll ? 'btn--active' : ''}`}
            onClick={() => changeAutoScroll(!autoScroll)}
            title="La hoja avanza sola al ritmo"
          >
            ↕ Auto
          </button>

          <label className="controls__field">
            <span>Zoom</span>
            <select value={zoom} onChange={(e) => changeZoom(Number(e.target.value))}>
              {ZOOMS.map((z) => (
                <option key={z} value={z}>
                  {Math.round(z * 100)}%
                </option>
              ))}
            </select>
          </label>
          <button
            className={`btn ${horizontal ? 'btn--active' : ''}`}
            onClick={() => changeLayout(!horizontal)}
            title="Diseño horizontal"
          >
            ↔ Horizontal
          </button>

          {tracks.length > 1 && (
            <div className="tracks">
              <button className={`btn ${showTracks ? 'btn--active' : ''}`} onClick={() => setShowTracks((v) => !v)}>
                Pistas ({tracks.length})
              </button>
              {showTracks && (
                <div className="tracks__menu">
                  {tracks.map((t) => (
                    <div key={t.index} className="tracks__row">
                      <label className="tracks__name">
                        <input
                          type="checkbox"
                          checked={t.visible}
                          onChange={(e) => updateTrack(t.index, { visible: e.target.checked })}
                        />
                        {t.name}
                      </label>
                      <button
                        className={`btn btn--xs ${t.mute ? 'btn--active' : ''}`}
                        onClick={() => updateTrack(t.index, { mute: !t.mute })}
                        title="Silenciar"
                      >
                        M
                      </button>
                      <button
                        className={`btn btn--xs ${t.solo ? 'btn--active' : ''}`}
                        onClick={() => updateTrack(t.index, { solo: !t.solo })}
                        title="Solo"
                      >
                        S
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
