import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TabViewer from '../components/TabViewer'
import { parseTex, texErrorMessage } from '../lib/alphatab'
import { NEW_TAB_TEMPLATE } from '../lib/samples'
import { emptyTab, store } from '../lib/storage'
import { INSTRUMENT_LABELS, type Instrument, type Tab } from '../lib/types'

const SNIPPETS: { label: string; text: string; help: string }[] = [
  { label: 'Compás', text: ' |\n', help: 'Separa compases con una barra vertical' },
  { label: 'Nota', text: ' 0.6', help: 'traste.cuerda  (0.6 = cuerda 6 al aire)' },
  { label: 'Acorde', text: ' (0.6 2.5 2.4)', help: 'Varias notas a la vez entre paréntesis' },
  { label: 'Silencio', text: ' r', help: 'r = silencio con la duración actual' },
  { label: 'Negras', text: ' :4', help: 'Duración por defecto: :1 :2 :4 :8 :16 :32' },
  { label: 'Corcheas', text: ' :8', help: 'Las notas siguientes serán corcheas' },
  { label: 'Hammer', text: '{h}', help: 'Añádelo tras una nota: 5.3{h}' },
  { label: 'Slide', text: '{sl}', help: 'Deslizamiento: 7.4{sl}' },
  { label: 'Bend', text: '{b (0 4)}', help: 'Bend de un tono: 7.3{b (0 4)}' },
  { label: 'Palm mute', text: '{pm}', help: 'Apagado con la palma' },
  { label: 'Bombo+HH', text: ' (KickHit HiHatClosed)', help: 'Batería: bombo y charles cerrado juntos' },
  { label: 'Caja', text: ' SnareHit', help: 'Batería: golpe de caja' },
]

const CHEATSHEET = `CABECERA (antes del punto solo)
  \\title "Nombre"   \\artist "Artista"   \\tempo 120
  .
PISTA
  \\track "Guitarra" "Gtr"      nombre y abreviatura
  \\instrument 30               30 = guitarra distorsionada, 25 = acústica, 33 = bajo
  \\instrument percussion       batería
  \\articulation defaults       (batería) permite usar nombres de piezas
  \\tuning E4 B3 G3 D3 A2 E2    afinación (bajo: G2 D2 A1 E1)
  \\ts 4 4                      compás

NOTAS
  traste.cuerda             3.5 = traste 3, cuerda 5
  traste.cuerda.duración    3.5.8 = corchea
  :8                        cambia la duración por defecto (1 2 4 8 16 32)
  r                         silencio
  (0.6 2.5 2.4)             acorde
  |                         fin de compás
  \\tempo 90                 cambio de tempo dentro de la pista

EFECTOS (entre llaves después de la nota)
  {h} hammer/pull   {sl} slide   {b (0 4)} bend   {v} vibrato
  {pm} palm mute    {x} nota muerta   {g} nota de adorno   {d} puntillo

BATERÍA (nombres de piezas)
  KickHit  SnareHit  SnareSideStick  HiHatClosed  HiHatOpen  HiHatHalf
  PedalHiHatHit  RideMiddle  RideBell  RideEdge  CrashHighHit  CrashMediumHit
  ChinaHit  SplashHit  HighTomHit  MidTomHit  LowTomHit  HighFloorTomHit  VeryLowTomHit`

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const [tab, setTab] = useState<Tab | null>(null)
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
      const t = emptyTab()
      t.tex = NEW_TAB_TEMPLATE.guitar
      setTab(t)
      setPreviewTex(t.tex)
    } else {
      store.get(id!).then((t) => {
        if (!t) {
          navigate('/')
          return
        }
        setTab(t)
        setTagsText(t.tags.join(', '))
        setPreviewTex(t.tex)
      })
    }
  }, [id, isNew, navigate])

  // Vista previa en vivo con un pequeño retraso para no redibujar en cada tecla
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

  const update = (patch: Partial<Tab>) => setTab((t) => (t ? { ...t, ...patch } : t))

  const onTexChange = (value: string) => {
    update({ tex: value })
    scheduleParse(value)
  }

  const onInstrumentChange = (inst: Instrument) => {
    if (!tab) return
    const template = NEW_TAB_TEMPLATE[inst]
    const untouched = Object.values(NEW_TAB_TEMPLATE).includes(tab.tex)
    update({ instrument: inst, ...(untouched && template ? { tex: template } : {}) })
    if (untouched && template) scheduleParse(template)
  }

  const insert = (text: string) => {
    const el = textRef.current
    if (!el || !tab) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = tab.tex.slice(0, start) + text + tab.tex.slice(end)
    onTexChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + text.length
    })
  }

  const meta = useMemo(() => {
    try {
      const score = parseTex(previewTex)
      return { title: score.title, artist: score.artist, tempo: score.tempo }
    } catch {
      return null
    }
  }, [previewTex])

  const onSave = async () => {
    if (!tab) return
    try {
      parseTex(tab.tex)
    } catch (err) {
      setParseError(texErrorMessage(err))
      return
    }
    setSaving(true)
    const tags = tagsText
      .split(',')
      .map((s) => s.trim().replace(/^#/, ''))
      .filter(Boolean)
    const final: Tab = {
      ...tab,
      title: tab.title.trim() || meta?.title || 'Sin título',
      artist: tab.artist.trim() || meta?.artist || '',
      tempo: meta?.tempo ?? tab.tempo,
      tags: Array.from(new Set(tags)),
      updatedAt: new Date().toISOString(),
    }
    await store.save(final)
    setSaving(false)
    navigate(`/tab/${final.id}`)
  }

  if (!tab) return <p className="page muted">Cargando…</p>

  return (
    <div className="editor">
      <div className="editor__form">
        <div className="field-row">
          <label className="field">
            <span>Título</span>
            <input value={tab.title} placeholder={meta?.title || 'Se toma de \\title si lo dejas vacío'} onChange={(e) => update({ title: e.target.value })} />
          </label>
          <label className="field">
            <span>Artista</span>
            <input value={tab.artist} placeholder={meta?.artist || 'Opcional'} onChange={(e) => update({ artist: e.target.value })} />
          </label>
          <label className="field field--small">
            <span>Instrumento</span>
            <select value={tab.instrument} onChange={(e) => onInstrumentChange(e.target.value as Instrument)}>
              {(Object.keys(INSTRUMENT_LABELS) as Instrument[]).map((k) => (
                <option key={k} value={k}>
                  {INSTRUMENT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Etiquetas (separadas por coma)</span>
            <input value={tagsText} placeholder="rock, pendiente, intro" onChange={(e) => setTagsText(e.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Notas</span>
          <input value={tab.notes} placeholder="Afinación, capo, recordatorios…" onChange={(e) => update({ notes: e.target.value })} />
        </label>
      </div>

      <div className="editor__body">
        <div className="editor__left">
          <div className="snippets">
            {SNIPPETS.map((s) => (
              <button key={s.label} className="btn btn--xs" title={s.help} onClick={() => insert(s.text)}>
                {s.label}
              </button>
            ))}
            <button className={`btn btn--xs ${showHelp ? 'btn--active' : ''}`} onClick={() => setShowHelp((v) => !v)}>
              ? Ayuda
            </button>
          </div>
          {showHelp && <pre className="cheatsheet">{CHEATSHEET}</pre>}
          <textarea
            ref={textRef}
            className="tex"
            spellCheck={false}
            value={tab.tex}
            onChange={(e) => onTexChange(e.target.value)}
          />
          {(parseError || renderError) && <pre className="error">{parseError || renderError}</pre>}
          <div className="editor__actions">
            <button className="btn btn--primary" onClick={onSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <Link className="btn" to={isNew ? '/' : `/tab/${tab.id}`}>
              Cancelar
            </Link>
          </div>
        </div>
        <div className="editor__right">
          <TabViewer tex={previewTex} compact onError={setRenderError} />
        </div>
      </div>
    </div>
  )
}
