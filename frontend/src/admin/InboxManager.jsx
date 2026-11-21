import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const PREFIX = { complaints: 'CMP', requests: 'REQ' }
const STATUSES = {
  complaints: ['New', 'In progress', 'Resolved'],
  requests: ['New', 'In progress', 'Done'],
}
const CONFIG = {
  complaints: { label: 'Complaints', cols: [['ref', 'Ref'], ['created_at', 'Date'], ['email', 'Student email'], ['routed_to', 'Sent to'], ['subject', 'Subject']] },
  requests: { label: 'Requests', cols: [['ref', 'Ref'], ['created_at', 'Date'], ['email', 'Student email'], ['type', 'Type']] },
  subscribers: { label: 'Subscribers', cols: [['email', 'Email'], ['created_at', 'Subscribed on']] },
}

const fmt = (s) => (s ? s.slice(0, 16).replace('T', ' ') : '')
const badge = (s) => (s === 'New' ? 'danger' : s === 'In progress' ? 'warning' : 'success')

function describeMail(m) {
  if (m.sent) return `Status saved. An email was sent to ${m.to}.`
  if (m.dry_run) return `Status saved. Email is not set up yet, so nothing was sent to ${m.to} (the message was printed in the Flask terminal).`
  if (m.skipped) return `Status saved. No email was sent because ${m.to} is a test address.`
  return `Status saved, but the email to ${m.to} could not be sent: ${m.error}`
}

export default function InboxManager({ name }) {
  const { token } = useAuth()
  const cfg = CONFIG[name]
  const statuses = STATUSES[name]

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [filter, setFilter] = useState('All')
  const [viewing, setViewing] = useState(null)
  const [emailStudent, setEmailStudent] = useState(true)

  useEffect(() => {
    let alive = true
    api(`/admin/${name}`, { token })
      .then((data) => alive && setRows(data))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [name, token])

  const ref = (r) => `${PREFIX[name]}-${String(r.id).padStart(6, '0')}`
  const value = (r, key) => (key === 'ref' ? ref(r) : key === 'created_at' ? fmt(r.created_at) : r[key])

  const setStatus = async (row, status) => {
    try {
      setError('')
      setInfo('')
      const r = await api(`/admin/${name}/${row.id}/status`, { method: 'PUT', body: { status, notify: emailStudent }, token })
      setRows((rs) => rs.map((x) => (x.id === row.id ? r.item : x)))
      if (viewing && viewing.id === row.id) setViewing(r.item)
      if (r.email) setInfo(describeMail(r.email))
    } catch (e) { setError(e.message) }
  }

  const remove = async (row) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    try {
      setError('')
      await api(`/admin/${name}/${row.id}`, { method: 'DELETE', token })
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      setViewing(null)
    } catch (e) { setError(e.message) }
  }

  const shown = statuses && filter !== 'All' ? rows.filter((r) => r.status === filter) : rows
  const newCount = statuses ? rows.filter((r) => r.status === 'New').length : 0

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h5 m-0">
          {cfg.label} <small className="text-muted">({rows.length})</small>
          {newCount > 0 && <Badge bg="danger" className="ms-2">{newCount} new</Badge>}
        </h2>
        {statuses && (
          <div className="d-flex align-items-center gap-3">
            <Form.Check type="checkbox" id={`email-student-${name}`} label="Email the student when I change the status"
              checked={emailStudent} onChange={(e) => setEmailStudent(e.target.checked)} className="small" />
            <Form.Select size="sm" style={{ width: 160 }} value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </Form.Select>
          </div>
        )}
      </div>

      {info && <Alert variant="success" dismissible onClose={() => setInfo('')}>{info}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>}

      {!loading && (
        <div className="table-responsive shadow-sm bg-white rounded">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                {cfg.cols.map(([, label]) => <th key={label}>{label}</th>)}
                {statuses && <th>Status</th>}
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  {cfg.cols.map(([key]) => <td key={key} className="small">{value(r, key)}</td>)}
                  {statuses && (
                    <td>
                      <Form.Select size="sm" value={r.status} onChange={(e) => setStatus(r, e.target.value)} style={{ minWidth: 120 }}>
                        {statuses.map((s) => <option key={s}>{s}</option>)}
                      </Form.Select>
                    </td>
                  )}
                  <td className="text-end text-nowrap">
                    {name !== 'subscribers' && (
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => setViewing(r)} aria-label="View details">
                        <i className="bi bi-eye"></i>
                      </Button>
                    )}
                    <Button size="sm" variant="outline-danger" onClick={() => remove(r)} aria-label="Delete">
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={cfg.cols.length + (statuses ? 2 : 1)} className="text-center text-muted py-4">Nothing here yet.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={!!viewing} onHide={() => setViewing(null)} centered>
        {viewing && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="h5">{ref(viewing)} <Badge bg={badge(viewing.status)}>{viewing.status}</Badge></Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <dl className="mb-0">
                {Object.entries(viewing)
                  .filter(([k]) => !['id', 'status'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="mb-2">
                      <dt className="small text-muted text-capitalize">{k.replace('_', ' ')}</dt>
                      <dd className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{k === 'created_at' ? fmt(v) : v}</dd>
                    </div>
                  ))}
              </dl>
            </Modal.Body>
            <Modal.Footer>
              <Form.Select size="sm" style={{ width: 160 }} value={viewing.status} onChange={(e) => setStatus(viewing, e.target.value)}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </Form.Select>
              <Button variant="outline-secondary" onClick={() => setViewing(null)}>Close</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  )
}
