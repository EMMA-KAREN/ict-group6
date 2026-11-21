import { useState } from 'react'
import { Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { departments } from '../data/mockData'
import { useData } from '../context/DataContext'

export default function Notices() {
  const { notices } = useData()
  const [dept, setDept] = useState('All')
  const [type, setType] = useState('All')

  const list = notices.filter(
    (n) => (dept === 'All' || n.department === dept) && (type === 'All' || n.type === type)
  )

  return (
    <>
      <PageHeader title="Academic Notice Board" subtitle="Notices and weekly schedules, filtered by department" icon="bi-megaphone" />
      <Container className="mt-4">
        <Row className="g-2 mb-4">
          <Col md={5}>
            <Form.Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department">
              <option value="All">All departments</option>
              {departments.map((d) => <option key={d}>{d}</option>)}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
              <option value="All">All types</option>
              <option>Notice</option>
              <option>Weekly schedule</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button variant="outline-secondary" className="w-100" onClick={() => { setDept('All'); setType('All') }}>
              Clear filters
            </Button>
          </Col>
        </Row>

        {list.length === 0 && <p className="text-muted">No notices match your filter.</p>}

        <Row xs={1} md={2} className="g-3">
          {list.map((n) => (
            <Col key={n.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge bg="success">{n.department}</Badge>
                    <small className="text-muted">{n.date}</small>
                  </div>
                  <Card.Title className="fs-6">{n.title}</Card.Title>
                  <Card.Text className="small text-muted">{n.body}</Card.Text>
                  {n.type === 'Weekly schedule' && (
                    <Button size="sm" className="btn-brand"><i className="bi bi-eye me-1"></i>View schedule</Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  )
}
