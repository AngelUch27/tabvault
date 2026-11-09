import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BackIcon } from '../components/Icons'
import TabViewer from '../components/TabViewer'
import { ensureSeeded, store } from '../lib/storage'
import type { Song } from '../lib/types'

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [song, setSong] = useState<Song | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ensureSeeded()
      .then(() => store.get(id))
      .then((s) => setSong(s ?? null))
  }, [id])

  const onDelete = async () => {
    if (!song) return
    if (!confirm(`Delete "${song.title || 'Untitled'}"? This cannot be undone.`)) return
    await store.remove(song.id)
    navigate('/')
  }

  if (song === undefined) return <p className="page muted">Loading…</p>
  if (song === null)
    return (
      <div className="page empty">
        <p>This song does not exist.</p>
        <Link className="btn" to="/">
          Back to songs
        </Link>
      </div>
    )

  return (
    <div className="player">
      <div className="player__head">
        <Link to="/" className="icon-btn icon-btn--ghost" aria-label="Back to songs" title="Songs">
          <BackIcon />
        </Link>
        <div className="player__meta">
          <h1 className="player__title">{song.title || 'Untitled'}</h1>
          <p className="player__sub">
            {song.artist && <span>{song.artist}</span>}
            {song.tempo ? <span>♩ = {song.tempo}</span> : null}
            {song.tags.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </p>
        </div>
        <div className="player__actions">
          <Link className="btn btn--ghost" to={`/edit/${song.id}`}>
            Edit
          </Link>
          <button className="btn btn--ghost btn--danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
      {song.notes && <p className="player__notes">{song.notes}</p>}
      {error && <pre className="error">{error}</pre>}
      <TabViewer tex={song.tex} onError={setError} />
    </div>
  )
}
