import { useState } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { resources } from './config'

const asOption = (o) => (typeof o === 'string' ? { value: o, label: o } : o)

function Field({ f, value, onChange, data }) {
  const required = f.required !== false
  const v = value ?? ''

  if (f.type === 'select') {
    return (
      <Form.Select required={required} value={v} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose...</option>
        {f.options.map(asOption).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Form.Select>
    )
  }
  if (f.type === 'refselect') {
    return (
      <Form.Select required={required} value={v} onChange={(e) => onChange(e.target.value)}>
        <option value="">None</option>
        {data[f.source].map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </Form.Select>
    )
  }
  if (f.type === 'multicontacts') {
    const chosen = String(v).split(',').filter(Boolean)
    const toggle = (id) => {
      const next = chosen.includes(String(id)) ? chosen.filter((x) => x !== String(id)) : [...chosen, String(id)]
      onChange(next.join(','))
    }
    return (
      <div className="border rounded p-2" style={{ maxHeight: 180, overflowY: 'auto' }}>
        {data.contacts.map((c) => (
          <Form.Check key={c.id} type="checkbox" id={`mc-${c.id}`} label={`${c.name} (${c.department})`}
            checked={chosen.includes(String(c.id))} onChange={() => toggle(c.id)} />
        ))}
      </div>
    )
  }
  if (f.type === 'textarea') {
    return <Form.Control as="textarea" rows={3} required={required} value={v} onChange={(e) => onChange(e.target.value)} />
  }
  return <Form.Control type={f.type} required={required} value={v} onChange={(e) => onChange(e.target.value)} />
}

export default function ResourceManager({ name }) {
  const cfg = resources[name]
  const data = useData()
  const { token } = useAuth()
  const rows = data[name]

  const [show, setShow] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [values, setValues] = useState(cfg.defaults())
  const [validated, setValidated] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [saving, setSaving] = useState(false)
  const [notify, setNotify] = useState(false)
  const [file, setFile] = useState(null)

  const openAdd = () => { setError(''); setInfo(''); setNotify(false); setFile(null); setEditingId(null); setValues(cfg.defaults()); setValidated(false); setShow(true) }
  const openEdit = (row) => { setError(''); setInfo(''); setFile(null); setEditingId(row.id); setValues({ ...row }); setValidated(false); setShow(true) }
  const close = () => setShow(false)

  const save = async (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) { setValidated(true); return }
    setSaving(true)
    setError('')
    try {
      let id = editingId
      if (editingId === null) {
        const row = await data.add(name, values)
        id = row.id
      } else {
        await data.update(name, editingId, values)
      }
      if (name === 'forms' && file) {
        try {
          await data.uploadFormFile(id, file)
        } catch (err) {
          close()
          setError(`The form was saved, but its file could not be uploaded: ${err.message}`)
          return
        }
      }
      close()
      if (name === 'notices' && editingId === null && notify) {
        try {
          const r = await api('/admin/notify', { method: 'POST', body: { subject: values.title, message: values.body }, token })
          setInfo(
            r.dry_run
              ? `Notice saved. Email is not set up yet, so nothing was sent (the message for ${r.recipients} subscriber(s) was printed in the Flask terminal).`
              : `Notice saved and emailed to ${r.sent} of ${r.recipients} subscriber(s).`
          )
        } catch (err) {
          setError(`Notice saved, but the email could not be sent: ${err.message}`)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const del = async (row) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    try {
      setError('')
      setInfo('')
      await data.remove(name, row.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const pickFile = (e) => {
    const f = e.target.files[0]
    if (!f) { setFile(null); return }
    if (!/\.(pdf|docx?)$/i.test(f.name)) { setError('Only PDF, DOC and DOCX files are allowed.'); e.target.value = ''; setFile(null); return }
    if (f.size > 10 * 1024 * 1024) { setError('The file is larger than 10 MB.'); e.target.value = ''; setFile(null); return }
    setError('')
    setFile(f)
  }

  const removeCurrentFile = async () => {
    try {
      const row = await data.removeFormFile(editingId)
      setValues((v) => ({ ...v, file_name: row.file_name, has_file: row.has_file, has_preview: row.has_preview }))
    } catch (err) { setError(err.message) }
  }

  const set = (key) => (val) => setValues({ ...values, [key]: val })
  const text = (v) => (v === null || v === undefined ? '' : String(v))

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 m-0">{cfg.label} <small className="text-muted">({rows.length})</small></h2>
        <Button className="btn-brand" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i>Add</Button>
      </div>

      {info && <Alert variant="success" dismissible onClose={() => setInfo('')}>{info}</Alert>}
      {error && !show && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive shadow-sm bg-white rounded">
        <Table hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              {cfg.columns.map((c) => <th key={c} className="text-capitalize">{c.replace('_', ' ')}</th>)}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {cfg.columns.map((c) => (
                  <td key={c} className="small" style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text(r[c])}</td>
                ))}
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(r)} aria-label="Edit">
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => del(r)} aria-label="Delete">
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={cfg.columns.length + 1} className="text-center text-muted py-4">Nothing here yet. Click Add.</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={show} onHide={close} centered>
        <Form noValidate validated={validated} onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title className="h5">{editingId === null ? 'Add' : 'Edit'} {cfg.label.replace(/s$/, '').toLowerCase()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            {cfg.fields.map((f) => (
              <Form.Group className="mb-3" key={f.key}>
                <Form.Label>{f.label}</Form.Label>
                <Field f={f} value={values[f.key]} onChange={set(f.key)} data={data} />
                {f.hint && <Form.Text muted>{f.hint}</Form.Text>}
                <Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>
              </Form.Group>
            ))}
            {name === 'forms' && (
              <Form.Group className="mb-3">
                <Form.Label>Form file (PDF or Word)</Form.Label>
                {editingId !== null && values.file_name && !file && (
                  <div className="small mb-2">
                    <i className="bi bi-paperclip me-1"></i>{values.file_name}
                    <Button variant="link" size="sm" className="text-danger p-0 ms-3" onClick={removeCurrentFile}>Remove file</Button>
                  </div>
                )}
                <Form.Control type="file" accept=".pdf,.doc,.docx" onChange={pickFile} />
                <Form.Text muted>Maximum 10 MB. Students can download it. PDF files can also be viewed in the browser, and so can Word files if LibreOffice is installed on the server.</Form.Text>
              </Form.Group>
            )}
            {name === 'notices' && editingId === null && (
              <Form.Check type="checkbox" id="notify-box" label="Also email this notice to subscribers" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={close}>Cancel</Button>
            <Button type="submit" className="btn-brand" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
