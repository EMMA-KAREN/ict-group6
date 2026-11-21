import { useState } from 'react'
import { Container, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ContactCard from '../components/ContactCard'
import { departments } from '../data/mockData'
import { useData } from '../context/DataContext'
import { api } from '../api'

const EMPTY = { email: '', department: '', subject: '', message: '' }

export default function Complaints() {
  const { contacts } = useData()
  const [validated, setValidated] = useState(false)
  const [sent, setSent] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState(EMPTY)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) { setValidated(true); return }
    setBusy(true)
    setError('')
    try {
      setSent(await api('/complaints', { method: 'POST', body: f }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const routedContact = sent && contacts.find((c) => c.department === sent.routed_to)

  return (
    <>
      <PageHeader title="Complaints" subtitle="Your complaint goes to the department concerned" icon="bi-chat-left-text" />
      <Container className="mt-4" style={{ maxWidth: 720 }}>
        {sent ? (
          <>
            <Alert variant="success">
              Complaint received. Your reference number is <strong>{sent.ref}</strong>. It was sent to <strong>{sent.routed_to}</strong>.<br />A confirmation email is on its way to {f.email}. You can follow the progress on the <Link to="/track">Track page</Link>.
            </Alert>
            <ContactCard c={routedContact} />
            <Button className="mt-3" variant="outline-secondary" onClick={() => { setSent(null); setValidated(false); setF(EMPTY) }}>
              Send another
            </Button>
          </>
        ) : (
          <Form noValidate validated={validated} onSubmit={submit} className="bg-white p-4 rounded shadow-sm">
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Your student email</Form.Label>
              <Form.Control type="email" required value={f.email} onChange={set('email')} />
              <Form.Control.Feedback type="invalid">Enter a valid email.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department concerned</Form.Label>
              <Form.Select required value={f.department} onChange={set('department')}>
                <option value="">Choose...</option>
                {departments.map((d) => <option key={d}>{d}</option>)}
                <option>Not sure</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">Choose a department.</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control required value={f.subject} onChange={set('subject')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Complaint</Form.Label>
              <Form.Control as="textarea" rows={5} required minLength={10} value={f.message} onChange={set('message')} />
              <Form.Control.Feedback type="invalid">Describe the complaint (at least 10 characters).</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className="btn-brand" disabled={busy}>{busy ? 'Sending...' : 'Submit complaint'}</Button>
          </Form>
        )}
      </Container>
    </>
  )
}
