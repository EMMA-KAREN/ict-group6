import { useEffect, useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

function describe(r) {
  if (r.nothing_to_send) return 'There were no notices in the last 7 days, so no recap was sent.'
  if (r.recipients === 0) return 'There are no subscribers yet, so nothing was sent.'
  if (r.dry_run) return `Email is not set up yet, so nothing was sent. The message for ${r.recipients} subscriber(s) was printed in the Flask terminal.`
  return `Sent ${r.sent} of ${r.recipients} email(s).${r.failed ? ` ${r.failed} failed.` : ''}`
}

export default function EmailPanel() {
  const { token } = useAuth()
  const [status, setStatus] = useState(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api('/admin/mail-status', { token }).then(setStatus).catch((e) => setError(e.message))
  }, [token])

  const run = async (path, body) => {
    setBusy(true); setError(''); setResult('')
    try {
      const r = await api(path, { method: 'POST', body, token })
      setResult(describe(r))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const send = (e) => {
    e.preventDefault()
    if (!window.confirm(`Send this email to ${status ? status.subscribers : 'all'} subscriber(s)?`)) return
    run('/admin/notify', { subject, message })
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h2 className="h5">Email subscribers</h2>
        {status && (
          <p className="small text-muted">
            {status.subscribers} subscriber(s).{' '}
            {status.configured
              ? 'Email sending is set up.'
              : 'Email sending is not set up yet: messages are printed in the Flask terminal only. Add the SMTP settings to server/.env to send real emails.'}
          </p>
        )}
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        {result && <Alert variant="success" className="py-2">{result}</Alert>}

        <Form onSubmit={send}>
          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} />
            <Form.Text muted>Every email ends with a link to unsubscribe.</Form.Text>
          </Form.Group>
          <Button type="submit" className="btn-brand me-2" disabled={busy}>{busy ? 'Sending...' : 'Send to all subscribers'}</Button>
          <Button variant="outline-secondary" disabled={busy} onClick={() => run('/admin/notify/weekly')}>
            Send the weekly recap now
          </Button>
        </Form>
      </Card.Body>
    </Card>
  )
}
