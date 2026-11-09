import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreIcon, PlusIcon, SearchIcon } from '../components/Icons'
import { fileToTex, scoreInstruments } from '../lib/alphatab'
import { downloadJson, emptySong, ensureSeeded, exportBackup, importBackup, store } from '../lib/storage'
import { INSTRUMENT_LABELS, INSTRUMENT_ORDER, type Instrument, type Song } from '../lib/types'

export default function Library() {
  const navigate = useNavigate()
  const [songs, setSongs] = useState<Song[] | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Instrument | 'all'>('all')
  const [message, setMessage] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const backupRef = useRef<HTMLInputElement>(null)

  const reload = async () => setSongs(await store.list())

  useEffect(() => {
    ensureSeeded().then(reload)
  }, [])

  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menu])

  const filtered = useMemo(() => {
    if (!songs) return []
    const q = query.trim().toLowerCase()
    return songs.filter((s) => {
      if (filter !== 'all' && !s.instruments.includes(filter)) return false
      if (!q) return true
      const hay = `${s.title} ${s.artist} ${s.tags.join(' ')} ${s.notes}`.toLowerCase()
      return hay.includes(q)
    })
  }, [songs, query, filter])

  const onImportFile = async (file: File) => {
    setMessage(null)
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { tex, score } = fileToTex(bytes)
      const song = emptySong()
      song.title = score.title || file.name.replace(/\.[^.]+$/, '')
      song.artist = score.artist
      song.tempo = score.tempo
      song.instruments = scoreInstruments(score)
      song.tags = ['imported']
      song.notes = `Imported from ${file.name}`
      song.tex = tex
      await store.save(song)
      navigate(`/song/${song.id}`)
    } catch (err) {
      setMessage(`Could not import "${file.name}": ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const onRestore = async (file: File) => {
    setMessage(null)
    try {
      const json = JSON.parse(await file.text())
      const count = await importBackup(json)
      await reload()
      setMessage(`${count} song${count === 1 ? '' : 's'} restored.`)
    } catch (err) {
      setMessage(`Could not restore: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const onExport = async () => {
    const data = await exportBackup()
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`tabvault-backup-${stamp}.json`, data)
  }

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1 className="page__title">Songs</h1>
          {songs && (
            <p className="page__sub">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'} · stored in this browser
            </p>
          )}
        </div>
        <div className="page__actions">
          <Link className="btn btn--primary" to="/new">
            <PlusIcon size={16} /> New song
          </Link>
          <div className="menu" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" onClick={() => setMenu((v) => !v)} aria-label="More" aria-expanded={menu}>
              <MoreIcon />
            </button>
            {menu && (
              <div className="menu__list">
                <button
                  onClick={() => {
                    setMenu(false)
                    fileRef.current?.click()
                  }}
                >
                  Import Guitar Pro / MusicXML…
                </button>
                <button
                  onClick={() => {
                    setMenu(false)
                    onExport()
                  }}
                >
                  Export backup (.json)
                </button>
                <button
                  onClick={() => {
                    setMenu(false)
                    backupRef.current?.click()
                  }}
                >
                  Restore backup…
                </button>
              </div>
            )}
          </div>
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

      <div className="filters">
        <label className="search">
          <SearchIcon size={16} />
          <input type="search" placeholder="Search title, artist or tag" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="chips">
          <button className={`chip ${filter === 'all' ? 'chip--on' : ''}`} onClick={() => setFilter('all')}>
            All
          </button>
          {INSTRUMENT_ORDER.filter((i) => i !== 'other').map((i) => (
            <button key={i} className={`chip ${filter === i ? 'chip--on' : ''}`} onClick={() => setFilter(i)}>
              <span className={`dot dot--${i}`} />
              {INSTRUMENT_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="notice" onClick={() => setMessage(null)}>
          {message}
        </div>
      )}

      {songs === null ? (
        <p className="muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>No songs match.</p>
          <Link className="btn" to="/new">
            Write your first song
          </Link>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((s) => (
            <Link key={s.id} to={`/song/${s.id}`} className="card">
              <div className="card__instruments">
                {s.instruments.map((i) => (
                  <span key={i} className={`dot dot--${i}`} title={INSTRUMENT_LABELS[i]} />
                ))}
                {s.tempo ? <span className="card__tempo">♩ {s.tempo}</span> : null}
              </div>
              <h3 className="card__title">{s.title || 'Untitled'}</h3>
              <p className="card__artist">{s.artist || '—'}</p>
              <div className="card__foot">
                <span className="card__tracks">
                  {s.instruments.map((i) => INSTRUMENT_LABELS[i]).join(' · ') || 'No tracks'}
                </span>
                {s.tags.length > 0 && <span className="card__tags">{s.tags.map((t) => `#${t}`).join(' ')}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
