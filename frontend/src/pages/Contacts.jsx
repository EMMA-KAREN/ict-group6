import { useState } from 'react'
import { Container, Row, Col, Card, Form } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { departments } from '../data/mockData'
import { useData } from '../context/DataContext'

export default function Contacts() {
  const { contacts } = useData()
  const [dept, setDept] = useState('All')
  const [q, setQ] = useState('')

  const list = contacts.filter(
    (c) =>
      (dept === 'All' || c.department === dept) &&
      (c.name + c.role).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      <PageHeader title="Contacts" subtitle="Who to contact, where their office is, and when to find them" icon="bi-telephone" />
      <Container className="mt-4">
        <Row className="g-2 mb-4">
          <Col md={6}>
            <Form.Control placeholder="Search by name or role..." value={q} onChange={(e) => setQ(e.target.value)} />
          </Col>
          <Col md={6}>
            <Form.Select value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="All">All departments</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </Form.Select>
          </Col>
        </Row>

        <Row xs={1} md={2} lg={3} className="g-3">
          {list.map((c) => (
            <Col key={c.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <Card.Title className="fs-6 mb-0">{c.name}</Card.Title>
                  <div className="text-muted small mb-2">{c.role} &middot; {c.department}</div>
                  <div className="small"><i className="bi bi-envelope me-2"></i><a href={`mailto:${c.email}`}>{c.email}</a></div>
                  <div className="small"><i className="bi bi-geo-alt me-2"></i>{c.office}</div>
                  <div className="small"><i className="bi bi-clock me-2"></i>{c.hours}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {list.length === 0 && <p className="text-muted">No contacts found.</p>}
      </Container>
    </>
  )
}
