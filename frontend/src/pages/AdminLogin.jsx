import { useState } from 'react'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const r = await login(username.trim(), password)
    if (r.ok) navigate('/admin')
    else setError(r.error)
  }

  return (
    <Container className="mt-5" style={{ maxWidth: 420 }}>
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <h1 className="h4 mb-3"><i className="bi bi-shield-lock me-2"></i>Admin login</h1>
          {error && <Alert variant="danger" className="py-2">{error}</Alert>}
          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control required autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Button type="submit" className="btn-brand w-100">Log in</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
