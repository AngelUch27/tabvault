import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fileToTex, guessInstrument } from '../lib/alphatab'
import { SAMPLE_TABS } from '../lib/samples'
import { downloadJson, emptyTab, exportBackup, importBackup, store } from '../lib/storage'
import { INSTRUMENT_LABELS, type Instrument, type Tab } from '../lib/types'

const SEED_KEY = 'tabvault.seeded'
const FILTERS: (Instrument | 'all')[] = ['all', 'guitar', 'bass', 'drums', 'multi', 'other']

export default function Library() {
  const navigate = useNavigate()
  const [tabs, setTabs] = useState<Tab[] | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Instrument | 'all'>('all')
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const backupRef = useRef<HTMLInputElement>(null)

  const reload = async () => setTabs(await store.list())

  useEffect(() => {
    ;(async () => {
      const list = await store.list()
      if (list.length === 0 && !localStorage.getItem(SEED_KEY)) {
        for (const sample of SAMPLE_TABS) await store.save(sample)
        localStorage.setItem(SEED_KEY, '1')
        setTabs(await store.list())
      } else {
        setTabs(list)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    if (!tabs) return []
    const q = query.trim().toLowerCase()
    return tabs.filter((t) => {
      if (filter !== 'all' && t.instrument !== filter) return false
      if (!q) return true
      const hay = `${t.title} ${t.artist} ${t.tags.join(' ')} ${t.notes}`.toLowerCase()
      return hay.includes(q)
    })
  }, [tabs, query, filter])

  const onImportFile = async (file: File) => {
    setMessage(null)
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { tex, score } = fileToTex(bytes)
      const tab = emptyTab()
      tab.title = score.title || file.name.replace(/\.[^.]+$/, '')
      tab.artist = score.artist
      tab.tempo = score.tempo
      tab.instrument = guessInstrument(score)
      tab.tags = ['importada']
      tab.notes = `Importada desde ${file.name}`
      tab.tex = tex
      await store.save(tab)
      navigate(`/tab/${tab.id}`)
    } catch (err) {
      setMessage(`No se pudo importar "${file.name}": ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const onRestore = async (file: File) => {
    setMessage(null)
    try {
      const json = JSON.parse(await file.text())
      const count = await importBackup(json)
      await reload()
      setMessage(`Se restauraron ${count} tablaturas.`)
    } catch (err) {
      setMessage(`No se pudo restaurar: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const onExport = async () => {
    const data = await exportBackup()
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`tabvault-copia-${stamp}.json`, data)
  }

  return (
    <div className="page">
      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Buscar por título, artista o etiqueta…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="toolbar__actions">
          <Link className="btn btn--primary" to="/new">
            + Nueva
          </Link>
          <button className="btn" onClick={() => fileRef.current?.click()} title="Guitar Pro (.gp3 a .gp8), MusicXML">
            Importar archivo
          </button>
          <button className="btn" onClick={onExport} title="Descarga todas tus tablaturas en un archivo JSON">
            Copia de seguridad
          </button>
          <button className="btn" onClick={() => backupRef.current?.click()}>
            Restaurar copia
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          accept=".gp,.gp3,.gp4,.gp5,.gpx,.gp6,.gp7,.gp8,.xml,.musicxml,.mxl,.cap,.capx"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImportFile(f)
            e.target.value = ''
          }}
        />
        <input
          ref={backupRef}
          type="file"
          hidden
          accept=".json,application/json"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onRestore(f)
            e.target.value = ''
          }}
        />
      </div>

      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f} className={`chip ${filter === f ? 'chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todas' : INSTRUMENT_LABELS[f]}
          </button>
        ))}
      </div>

      {message && (
        <div className="notice" onClick={() => setMessage(null)}>
          {message}
        </div>
      )}

      {tabs === null ? (
        <p className="muted">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>No hay tablaturas que coincidan.</p>
          <Link className="btn btn--primary" to="/new">
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((t) => (
            <Link key={t.id} to={`/tab/${t.id}`} className={`card card--${t.instrument}`}>
              <div className="card__top">
                <span className="badge">{INSTRUMENT_LABELS[t.instrument]}</span>
                {t.tempo ? <span className="muted">♩ = {t.tempo}</span> : null}
              </div>
              <h3 className="card__title">{t.title || 'Sin título'}</h3>
              <p className="card__artist">{t.artist || '—'}</p>
              {t.tags.length > 0 && (
                <div className="card__tags">
                  {t.tags.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="card__date muted">Editada {new Date(t.updatedAt).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
