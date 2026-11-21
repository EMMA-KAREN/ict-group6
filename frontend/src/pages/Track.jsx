import { useState } from 'react'
import { Container, Form, Button, Alert, Card, Badge } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const color = (s) => (s === 'New' ? 'danger' : s === 'In progress' ? 'warning' : 'success')

export default function Track() {
  const [ref, setRef] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(await api(`/track?ref=${encodeURIComponent(ref.trim())}&email=${encodeURIComponent(email.trim())}`))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Track a complaint or request" subtitle="Use the reference number from your confirmation email" icon="bi-search-heart" />
      <Container className="mt-4" style={{ maxWidth: 560 }}>
        <Form onSubmit={submit} className="bg-white p-4 rounded shadow-sm mb-3">
          <Form.Group className="mb-3">
            <Form.Label>Reference number</Form.Label>
            <Form.Control required placeholder="CMP-000001 or REQ-000001" value={ref} onChange={(e) => setRef(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email you used</Form.Label>
            <Form.Control type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Button type="submit" className="btn-brand" disabled={busy}>{busy ? 'Checking...' : 'Check status'}</Button>
        </Form>

        {error && <Alert variant="warning">{error}</Alert>}

        {result && (
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small text-capitalize">{result.kind} {result.ref}</div>
                  <div className="fw-semibold">{result.title}</div>
                </div>
                <Badge bg={color(result.status)} className="fs-6">{result.status}</Badge>
              </div>
              {result.routed_to && <div className="small mt-2"><i className="bi bi-building me-2"></i>Sent to {result.routed_to}</div>}
              <div className="small text-muted mt-1"><i className="bi bi-clock me-2"></i>Received {String(result.created_at).slice(0, 16).replace('T', ' ')}</div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  )
}
