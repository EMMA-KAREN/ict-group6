import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, InputGroup, Button } from 'react-bootstrap'

export default function SearchBar() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <Form onSubmit={submit}>
      <InputGroup size="lg">
        <Form.Control
          placeholder="Search by keyword, e.g. fees, exam, missing marks..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit" className="btn-accent">
          <i className="bi bi-search me-1"></i>Search
        </Button>
      </InputGroup>
    </Form>
  )
}
