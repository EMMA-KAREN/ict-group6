import { Container, Row, Col, ListGroup, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ModuleCard from '../components/ModuleCard'
import SubscribeBox from '../components/SubscribeBox'
import { modules } from '../data/mockData'
import { useData } from '../context/DataContext'

export default function Home() {
  const { notices } = useData()
  return (
    <>
      <section className="hero py-5">
        <Container className="py-4 text-center">
          <h1 className="display-5 fw-bold">Everything you need, in one place</h1>
          <p className="lead mb-4">Find notices, forms, contacts, exam and fee information without visiting several offices.</p>
          <Row className="justify-content-center">
            <Col md={9} lg={7}><SearchBar /></Col>
          </Row>
        </Container>
      </section>

      <Container className="mt-5">
        <h2 className="h4 mb-3">Services</h2>
        <Row xs={2} md={3} lg={4} className="g-3">
          {modules.map((m) => (
            <Col key={m.title}><ModuleCard {...m} /></Col>
          ))}
        </Row>

        <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
          <h2 className="h4 m-0">Latest Notices</h2>
          <Link to="/notices">View all</Link>
        </div>
        <ListGroup className="shadow-sm">
          {notices.slice(0, 3).map((n) => (
            <ListGroup.Item key={n.id} className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-semibold">{n.title}</div>
                <small className="text-muted">{n.date}</small>
              </div>
              <Badge bg="success">{n.department}</Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="mt-5"><SubscribeBox /></div>
      </Container>
    </>
  )
}
