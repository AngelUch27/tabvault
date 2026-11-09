import { useEffect, useRef, useState } from 'react'
import * as alphaTab from '@coderline/alphatab'
import { FONT_DIRECTORY, SOUNDFONT_URL, parseTex, trackInstrument } from '../lib/alphatab'
import { INSTRUMENT_LABELS, type Instrument } from '../lib/types'
import {
  FollowIcon,
  LayoutIcon,
  LayoutWideIcon,
  MetronomeIcon,
  MixerIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  StopIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './Icons'

interface TrackState {
  index: number
  name: string
  instrument: Instrument
  mute: boolean
}

interface Props {
  tex: string
  compact?: boolean
  onError?: (message: string | null) => void
}

const SPEEDS = [0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5]
const ZOOMS = [0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.3, 1.5]

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
  const selectedRef = useRef<number | 'all'>(0)

  const [ready, setReady] = useState(false)
  const [rendering, setRendering] = useState(true)
  const [sfProgress, setSfProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [loop, setLoop] = useState(false)
  const [metronome, setMetronome] = useState(false)
  const [countIn, setCountIn] = useState(false)
  const [follow, setFollow] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [horizontal, setHorizontal] = useState(false)
  const [tracks, setTracks] = useState<TrackState[]>([])
  const [selected, setSelected] = useState<number | 'all'>(0)
  const [solo, setSolo] = useState(false)
  const [showMixer, setShowMixer] = useState(false)
  const [endTime, setEndTime] = useState(0)

  // Create the alphaTab instance once
  useEffect(() => {
    const main = mainRef.current
    const scroll = scrollRef.current
    if (!main || !scroll) return

    const settings = new alphaTab.Settings()
    settings.core.fontDirectory = FONT_DIRECTORY
    settings.core.logLevel = alphaTab.LogLevel.Warning
    settings.player.playerMode = alphaTab.PlayerMode.EnabledSynthesizer
    settings.player.soundFont = SOUNDFONT_URL
    settings.player.scrollElement = scroll
    settings.player.scrollMode = alphaTab.ScrollMode.Continuous
    settings.player.scrollOffsetY = -48
    settings.player.enableCursor = true
    settings.player.enableAnimatedBeatCursor = true
    settings.player.enableElementHighlighting = true
    settings.display.layoutMode = alphaTab.LayoutMode.Page
    settings.display.scale = 1
    settings.display.resources.mainGlyphColor = color('#1c1c1e')
    settings.display.resources.secondaryGlyphColor = color('#5a5e66')
    settings.display.resources.staffLineColor = color('#9a9ea6')
    settings.display.resources.barSeparatorColor = color('#1c1c1e')
    settings.display.resources.barNumberColor = color('#9a7b2f')
    settings.display.resources.scoreInfoColor = color('#1c1c1e')

    const api = new alphaTab.AlphaTabApi(main, settings)
    apiRef.current = api

    api.renderStarted.on(() => setRendering(true))
    api.renderFinished.on(() => setRendering(false))
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

  // Load the score whenever the source changes
  useEffect(() => {
    const api = apiRef.current
    if (!api || !tex.trim()) return
    try {
      const score = parseTex(tex)
      onErrorRef.current?.(null)
      const next: TrackState[] = score.tracks.map((t) => ({
        index: t.index,
        name: t.name || `Track ${t.index + 1}`,
        instrument: trackInstrument(t),
        mute: false,
      }))
      setTracks(next)
      let sel = selectedRef.current
      if (sel !== 'all' && sel >= next.length) sel = 0
      if (next.length <= 1) sel = 'all'
      selectedRef.current = sel
      setSelected(sel)
      setSolo(false)
      const indexes = sel === 'all' ? next.map((t) => t.index) : [sel]
      api.renderScore(score, indexes)
    } catch (err) {
      onErrorRef.current?.(err instanceof Error ? err.message : String(err))
    }
  }, [tex])

  const rerender = () => {
    const api = apiRef.current
    if (!api) return
    api.updateSettings()
    api.render()
  }

  const select = (value: number | 'all') => {
    const api = apiRef.current
    selectedRef.current = value
    setSelected(value)
    if (!api?.score) return
    const score = api.score
    const list = value === 'all' ? score.tracks : [score.tracks[value]].filter(Boolean)
    if (list.length) api.renderTracks(list)
    if (solo) {
      // keep "hear only what I see" in sync with the new selection
      api.changeTrackSolo(score.tracks, false)
      if (value !== 'all') api.changeTrackSolo([score.tracks[value]], true)
    }
  }

  const toggleSolo = () => {
    const api = apiRef.current
    const next = !solo
    setSolo(next)
    if (!api?.score || selected === 'all') return
    api.changeTrackSolo(api.score.tracks, false)
    if (next) api.changeTrackSolo([api.score.tracks[selected]], true)
  }

  const toggleMute = (index: number) => {
    const api = apiRef.current
    const next = tracks.map((t) => (t.index === index ? { ...t, mute: !t.mute } : t))
    setTracks(next)
    const t = next.find((x) => x.index === index)
    if (api?.score && t) api.changeTrackMute([api.score.tracks[index]], t.mute)
  }

  const changeZoom = (dir: 1 | -1) => {
    const i = ZOOMS.indexOf(zoom)
    const value = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + dir))]
    if (value === zoom) return
    setZoom(value)
    if (apiRef.current) {
      apiRef.current.settings.display.scale = value
      rerender()
    }
  }

  const changeLayout = () => {
    const h = !horizontal
    setHorizontal(h)
    if (apiRef.current) {
      apiRef.current.settings.display.layoutMode = h ? alphaTab.LayoutMode.Horizontal : alphaTab.LayoutMode.Page
      rerender()
    }
  }

  const changeFollow = () => {
    const on = !follow
    setFollow(on)
    if (apiRef.current) {
      apiRef.current.settings.player.scrollMode = on ? alphaTab.ScrollMode.Continuous : alphaTab.ScrollMode.Off
      apiRef.current.updateSettings()
    }
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

  const multi = tracks.length > 1

  return (
    <div className={`viewer ${compact ? 'viewer--compact' : ''}`}>
      {multi && (
        <div className="viewer__bar">
          <div className="seg" role="tablist" aria-label="Instrument">
            {tracks.map((t) => (
              <button
                key={t.index}
                role="tab"
                aria-selected={selected === t.index}
                className={`seg__btn ${selected === t.index ? 'seg__btn--on' : ''}`}
                onClick={() => select(t.index)}
              >
                <span className={`dot dot--${t.instrument}`} />
                {t.name || INSTRUMENT_LABELS[t.instrument]}
              </button>
            ))}
            <button
              role="tab"
              aria-selected={selected === 'all'}
              className={`seg__btn ${selected === 'all' ? 'seg__btn--on' : ''}`}
              onClick={() => select('all')}
            >
              All
            </button>
          </div>
          <label className={`switch ${selected === 'all' ? 'switch--off' : ''}`} title="Hear only the instrument you are viewing">
            <input type="checkbox" checked={solo} disabled={selected === 'all'} onChange={toggleSolo} />
            <span className="switch__track" />
            <span>Solo</span>
          </label>
        </div>
      )}

      <div className="viewer__scroll" ref={scrollRef}>
        {rendering && <div className="viewer__overlay">Rendering…</div>}
        <div className="viewer__paper">
          <div ref={mainRef} className="at-main" />
        </div>
      </div>

      <div className="controls">
        <div className="controls__group controls__group--transport">
          <button
            className="icon-btn icon-btn--primary"
            onClick={() => apiRef.current?.playPause()}
            disabled={!ready}
            title={ready ? (playing ? 'Pause' : 'Play') : `Loading sounds… ${sfProgress}%`}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          <button className="icon-btn" onClick={() => apiRef.current?.stop()} disabled={!ready} title="Stop" aria-label="Stop">
            <StopIcon size={16} />
          </button>
          <span className="controls__time">
            <span ref={posRef}>0:00</span>
            <span className="controls__sep">/</span>
            {fmt(endTime)}
          </span>
          {!ready && <span className="controls__loading">sounds {sfProgress}%</span>}
        </div>

        <div className="controls__group">
          <select className="pill-select" value={speed} onChange={(e) => changeSpeed(Number(e.target.value))} title="Playback speed">
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {Math.round(s * 100)}%
              </option>
            ))}
          </select>
          <button className={`icon-btn ${loop ? 'icon-btn--on' : ''}`} onClick={toggleLoop} title="Loop" aria-pressed={loop}>
            <RepeatIcon />
          </button>
          <button
            className={`icon-btn ${metronome ? 'icon-btn--on' : ''}`}
            onClick={toggleMetronome}
            title="Metronome"
            aria-pressed={metronome}
          >
            <MetronomeIcon />
          </button>
          <button
            className={`icon-btn icon-btn--text ${countIn ? 'icon-btn--on' : ''}`}
            onClick={toggleCountIn}
            title="Count-in before playing"
            aria-pressed={countIn}
          >
            1·2·3·4
          </button>
          <button
            className={`icon-btn ${follow ? 'icon-btn--on' : ''}`}
            onClick={changeFollow}
            title="Follow: the sheet scrolls with the music"
            aria-pressed={follow}
          >
            <FollowIcon />
          </button>
        </div>

        <div className="controls__group controls__group--right">
          <button className="icon-btn" onClick={() => changeZoom(-1)} title="Zoom out" disabled={zoom === ZOOMS[0]}>
            <ZoomOutIcon />
          </button>
          <span className="controls__zoom">{Math.round(zoom * 100)}%</span>
          <button className="icon-btn" onClick={() => changeZoom(1)} title="Zoom in" disabled={zoom === ZOOMS[ZOOMS.length - 1]}>
            <ZoomInIcon />
          </button>
          <button className="icon-btn" onClick={changeLayout} title={horizontal ? 'Page layout' : 'Horizontal layout'}>
            {horizontal ? <LayoutIcon /> : <LayoutWideIcon />}
          </button>
          {multi && (
            <div className="mixer">
              <button
                className={`icon-btn ${showMixer ? 'icon-btn--on' : ''}`}
                onClick={() => setShowMixer((v) => !v)}
                title="Mixer: mute individual tracks"
                aria-expanded={showMixer}
              >
                <MixerIcon />
              </button>
              {showMixer && (
                <div className="mixer__menu">
                  <div className="mixer__title">Mixer</div>
                  {tracks.map((t) => (
                    <label key={t.index} className="mixer__row">
                      <span className={`dot dot--${t.instrument}`} />
                      <span className="mixer__name">{t.name}</span>
                      <input type="checkbox" checked={!t.mute} onChange={() => toggleMute(t.index)} />
                      <span className="mixer__state">{t.mute ? 'muted' : 'on'}</span>
                    </label>
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
