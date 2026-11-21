import { useState } from 'react'
import { Card, Form, InputGroup, Button, Alert } from 'react-bootstrap'
import { api } from '../api'

export default function SubscribeBox() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api('/subscribers', { method: 'POST', body: { email } })
      setDone(true)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h2 className="h5"><i className="bi bi-bell me-2"></i>Get notifications by email</h2>
        <p className="small text-muted">Receive announcements, exam changes and a weekly recap in your student email.</p>
        {error && <Alert variant="danger" className="py-2">{error}</Alert>}
        {done ? (
          <Alert variant="success" className="mb-0">You are subscribed. Notifications will go to {email}.</Alert>
        ) : (
          <Form onSubmit={submit}>
            <InputGroup>
              <Form.Control type="email" required placeholder="Your student email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" className="btn-brand">Subscribe</Button>
            </InputGroup>
          </Form>
        )}
      </Card.Body>
    </Card>
  )
}
