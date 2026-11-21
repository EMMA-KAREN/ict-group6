import { useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const types = ['Letter of introduction', 'Change of course', 'Re-issue of student ID', 'Accommodation enquiry', 'Other']

export default function Requests() {
  const [validated, setValidated] = useState(false)
  const [ref, setRef] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({ email: '', type: '', details: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) { setValidated(true); return }
    setBusy(true)
    setError('')
    try {
      const data = await api('/requests', { method: 'POST', body: f })
      setRef(data.ref)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Student Requests" subtitle="Submit a request online" icon="bi-send" />
      <Container className="mt-4" style={{ maxWidth: 720 }}>
        {ref ? (
          <Alert variant="success">
            Request submitted. Your reference number is <strong>{ref}</strong>. A confirmation email is on its way to {f.email}. You can follow the progress on the <Link to="/track">Track page</Link>.
          </Alert>
        ) : (
          <Form noValidate validated={validated} onSubmit={submit} className="bg-white p-4 rounded shadow-sm">
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Your student email</Form.Label>
              <Form.Control type="email" required value={f.email} onChange={set('email')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type of request</Form.Label>
              <Form.Select required value={f.type} onChange={set('type')}>
                <option value="">Choose...</option>
                {types.map((t) => <option key={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Details</Form.Label>
              <Form.Control as="textarea" rows={4} required minLength={10} value={f.details} onChange={set('details')} />
            </Form.Group>
            <Button type="submit" className="btn-brand" disabled={busy}>{busy ? 'Sending...' : 'Submit request'}</Button>
          </Form>
        )}
      </Container>
    </>
  )
}
