import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TabViewer from '../components/TabViewer'
import { ensureSeeded, store } from '../lib/storage'
import { INSTRUMENT_LABELS, type Tab } from '../lib/types'

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ensureSeeded()
      .then(() => store.get(id))
      .then((t) => setTab(t ?? null))
  }, [id])

  const onDelete = async () => {
    if (!tab) return
    if (!confirm(`¿Eliminar "${tab.title || 'Sin título'}"? Esta acción no se puede deshacer.`)) return
    await store.remove(tab.id)
    navigate('/')
  }

  if (tab === undefined) return <p className="page muted">Cargando…</p>
  if (tab === null)
    return (
      <div className="page empty">
        <p>Esta tablatura no existe.</p>
        <Link className="btn" to="/">
          Volver a la biblioteca
        </Link>
      </div>
    )

  return (
    <div className="player">
      <div className="player__head">
        <div className="player__meta">
          <span className="badge">{INSTRUMENT_LABELS[tab.instrument]}</span>
          <h2 className="player__title">{tab.title || 'Sin título'}</h2>
          {tab.artist && <span className="player__artist">{tab.artist}</span>}
          {tab.tags.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
        <div className="player__actions">
          <Link className="btn" to={`/edit/${tab.id}`}>
            Editar
          </Link>
          <button className="btn btn--danger" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </div>
      {tab.notes && <p className="player__notes">{tab.notes}</p>}
      {error && <pre className="error">{error}</pre>}
      <TabViewer tex={tab.tex} onError={setError} />
    </div>
  )
}
