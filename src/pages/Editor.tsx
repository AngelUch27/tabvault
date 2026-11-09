import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HelpIcon } from '../components/Icons'
import TabViewer from '../components/TabViewer'
import { parseTex, scoreInstruments, texErrorMessage } from '../lib/alphatab'
import { NEW_SONG_TEMPLATE, TRACK_SNIPPETS } from '../lib/samples'
import { emptySong, store } from '../lib/storage'
import { INSTRUMENT_LABELS, type Song } from '../lib/types'

const SNIPPETS: { label: string; text: string; help: string }[] = [
  { label: 'Bar', text: ' |\n', help: 'Separate bars with a vertical bar' },
  { label: 'Note', text: ' 0.6', help: 'fret.string  (0.6 = open 6th string)' },
  { label: 'Chord', text: ' (0.6 2.5 2.4)', help: 'Several notes at once in parentheses' },
  { label: 'Rest', text: ' r', help: 'r = rest with the current duration' },
  { label: ':4', text: ' :4', help: 'Default duration: :1 :2 :4 :8 :16 :32' },
  { label: ':8', text: ' :8', help: 'Following notes are eighth notes' },
  { label: 'Hammer', text: '{h}', help: 'Append after a note: 5.3{h}' },
  { label: 'Slide', text: '{sl}', help: 'Slide: 7.4{sl}' },
  { label: 'Bend', text: '{b (0 4)}', help: 'Full-tone bend: 7.3{b (0 4)}' },
  { label: 'Palm mute', text: '{pm}', help: 'Palm mute' },
  { label: 'Kick+HH', text: ' (KickHit HiHatClosed)', help: 'Drums: kick and closed hi-hat together' },
  { label: 'Snare', text: ' SnareHit', help: 'Drums: snare hit' },
]

const CHEATSHEET = `HEADER (before the lone dot)
  \\title "Name"   \\artist "Artist"   \\tempo 120
  .
TRACK (repeat for each instrument of the song)
  \\track "Guitar" "Gtr"        name and short name
  \\instrument 30               30 distortion guitar, 25 acoustic, 33 bass
  \\instrument percussion       drums
  \\articulation defaults       (drums) allows drum piece names
  \\tuning E4 B3 G3 D3 A2 E2    tuning (bass: G2 D2 A1 E1)
  \\ts 4 4                      time signature

NOTES
  fret.string               3.5 = fret 3 on string 5
  fret.string.duration      3.5.8 = eighth note
  :8                        default duration (1 2 4 8 16 32)
  r                         rest
  (0.6 2.5 2.4)             chord
  |                         end of bar
  \\tempo 90                 tempo change inside a track

EFFECTS (in braces after the note)
  {h} hammer/pull   {sl} slide   {b (0 4)} bend   {v} vibrato
  {pm} palm mute    {x} dead note   {g} grace note   {d} dotted

DRUMS (piece names)
  KickHit  SnareHit  SnareSideStick  HiHatClosed  HiHatOpen  HiHatHalf
  PedalHiHatHit  RideMiddle  RideBell  RideEdge  CrashHighHit  CrashMediumHit
  ChinaHit  SplashHit  HighTomHit  MidTomHit  LowTomHit  HighFloorTomHit  VeryLowTomHit`

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [song, setSong] = useState<Song | null>(null)
  const [tagsText, setTagsText] = useState('')
  const [previewTex, setPreviewTex] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [saving, setSaving] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (isNew) {
      const s = emptySong()
      s.tex = NEW_SONG_TEMPLATE
      setSong(s)
      setPreviewTex(s.tex)
    } else {
      store.get(id!).then((s) => {
        if (!s) {
          navigate('/')
          return
        }
        setSong(s)
        setTagsText(s.tags.join(', '))
        setPreviewTex(s.tex)
      })
    }
  }, [id, isNew, navigate])

  // Live preview with a short delay so we do not re-render on every keystroke
  const scheduleParse = (tex: string) => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      try {
        parseTex(tex)
        setParseError(null)
        setPreviewTex(tex)
      } catch (err) {
        setParseError(texErrorMessage(err))
      }
    }, 600)
  }

  const update = (patch: Partial<Song>) => setSong((s) => (s ? { ...s, ...patch } : s))

  const onTexChange = (value: string) => {
    update({ tex: value })
    scheduleParse(value)
  }

  const insert = (text: string, atEnd = false) => {
    const el = textRef.current
    if (!el || !song) return
    const start = atEnd ? song.tex.length : el.selectionStart
    const end = atEnd ? song.tex.length : el.selectionEnd
    const prefix = atEnd && !song.tex.endsWith('\n') ? '\n' : ''
    const next = song.tex.slice(0, start) + prefix + text + song.tex.slice(end)
    onTexChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + prefix.length + text.length
      if (atEnd) el.scrollTop = el.scrollHeight
    })
  }

  const meta = useMemo(() => {
    try {
      const score = parseTex(previewTex)
      return { title: score.title, artist: score.artist, tempo: score.tempo, instruments: scoreInstruments(score) }
    } catch {
      return null
    }
  }, [previewTex])

  const onSave = async () => {
    if (!song) return
    let instruments = song.instruments
    try {
      instruments = scoreInstruments(parseTex(song.tex))
    } catch (err) {
      setParseError(texErrorMessage(err))
      return
    }
    setSaving(true)
    const tags = tagsText
      .split(',')
      .map((s) => s.trim().replace(/^#/, ''))
      .filter(Boolean)
    const final: Song = {
      ...song,
      title: song.title.trim() || meta?.title || 'Untitled',
      artist: song.artist.trim() || meta?.artist || '',
      tempo: meta?.tempo ?? song.tempo,
      instruments,
      tags: Array.from(new Set(tags)),
      updatedAt: new Date().toISOString(),
    }
    await store.save(final)
    setSaving(false)
    navigate(`/song/${final.id}`)
  }

  if (!song) return <p className="page muted">Loading…</p>

  return (
    <div className="editor">
      <div className="editor__head">
        <h1 className="page__title">{isNew ? 'New song' : 'Edit song'}</h1>
        <div className="editor__actions">
          <Link className="btn btn--ghost" to={isNew ? '/' : `/song/${song.id}`}>
            Cancel
          </Link>
          <button className="btn btn--primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="editor__form">
        <label className="field">
          <span>Title</span>
          <input value={song.title} placeholder={meta?.title || 'Taken from \\title if empty'} onChange={(e) => update({ title: e.target.value })} />
        </label>
        <label className="field">
          <span>Artist</span>
          <input value={song.artist} placeholder={meta?.artist || 'Optional'} onChange={(e) => update({ artist: e.target.value })} />
        </label>
        <label className="field">
          <span>Tags</span>
          <input value={tagsText} placeholder="rock, to learn, intro" onChange={(e) => setTagsText(e.target.value)} />
        </label>
        <label className="field">
          <span>Notes</span>
          <input value={song.notes} placeholder="Capo, tuning, reminders…" onChange={(e) => update({ notes: e.target.value })} />
        </label>
      </div>

      <div className="editor__body">
        <div className="editor__left">
          <div className="editor__tools">
            <div className="editor__tracks">
              <span className="muted">Tracks:</span>
              {meta?.instruments.length ? (
                meta.instruments.map((i) => (
                  <span key={i} className="trackpill">
                    <span className={`dot dot--${i}`} />
                    {INSTRUMENT_LABELS[i]}
                  </span>
                ))
              ) : (
                <span className="muted">none yet</span>
              )}
              <span className="editor__add">
                {(['guitar', 'bass', 'drums'] as const).map((i) => (
                  <button key={i} className="chip" onClick={() => insert(TRACK_SNIPPETS[i], true)} title={`Add a ${i} track at the end`}>
                    + {INSTRUMENT_LABELS[i]}
                  </button>
                ))}
              </span>
            </div>
            <div className="snippets">
              {SNIPPETS.map((s) => (
                <button key={s.label} className="chip chip--xs" title={s.help} onClick={() => insert(s.text)}>
                  {s.label}
                </button>
              ))}
              <button className={`chip chip--xs ${showHelp ? 'chip--on' : ''}`} onClick={() => setShowHelp((v) => !v)}>
                <HelpIcon size={13} /> Syntax
              </button>
            </div>
          </div>
          {showHelp && <pre className="cheatsheet">{CHEATSHEET}</pre>}
          <textarea ref={textRef} className="tex" spellCheck={false} value={song.tex} onChange={(e) => onTexChange(e.target.value)} />
          {(parseError || renderError) && <pre className="error">{parseError || renderError}</pre>}
        </div>
        <div className="editor__right">
          <TabViewer tex={previewTex} compact onError={setRenderError} />
        </div>
      </div>
    </div>
  )
}
