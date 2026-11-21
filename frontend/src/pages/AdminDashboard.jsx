import { Container, Row, Col, Card, Tabs, Tab, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ResourceManager from '../admin/ResourceManager'
import InboxManager from '../admin/InboxManager'
import EmailPanel from '../admin/EmailPanel'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const CONTENT = [['notices', 'Notices'], ['forms', 'Forms'], ['contacts', 'Contacts'], ['faqs', 'FAQs']]
const GUIDES = [
  ['guides', 'Guides'], ['units', 'Units'], ['fees', 'Fees'], ['course_requirements', 'Requirements'],
  ['exam_timetable', 'Exam timetable'], ['academic_calendar', 'Calendar'], ['assignments', 'Assignments'],
]
const INBOXES = [['complaints', 'Complaints'], ['requests', 'Requests'], ['subscribers', 'Subscribers']]

function Pills({ items, render }) {
  return (
    <Tabs defaultActiveKey={items[0][0]} variant="pills" className="mb-3 gap-1" mountOnEnter unmountOnExit>
      {items.map(([key, title]) => <Tab key={key} eventKey={key} title={title}>{render(key)}</Tab>)}
    </Tabs>
  )
}

export default function AdminDashboard() {
  const data = useData()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const stats = [
    { label: 'Notices', n: data.notices.length, icon: 'bi-megaphone' },
    { label: 'Forms', n: data.forms.length, icon: 'bi-file-earmark-text' },
    { label: 'Contacts', n: data.contacts.length, icon: 'bi-telephone' },
    { label: 'Guides', n: data.guides.length, icon: 'bi-signpost-split' },
  ]

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Manage portal content, student messages and emails" icon="bi-speedometer2" />
      <Container className="mt-4">
        <div className="d-flex justify-content-end mb-3">
          <Button variant="outline-danger" size="sm" onClick={() => { logout(); navigate('/') }}>
            <i className="bi bi-box-arrow-right me-1"></i>Log out
          </Button>
        </div>

        <Row xs={2} md={4} className="g-3 mb-4">
          {stats.map((s) => (
            <Col key={s.label}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <i className={`bi ${s.icon} module-icon`}></i>
                  <div className="fs-3 fw-bold">{s.n}</div>
                  <div className="small text-muted">{s.label}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Tabs defaultActiveKey="content" className="mb-3" mountOnEnter unmountOnExit>
          <Tab eventKey="content" title="Content">
            <Pills items={CONTENT} render={(k) => <ResourceManager name={k} />} />
          </Tab>
          <Tab eventKey="guides" title="Guides & academics">
            <Pills items={GUIDES} render={(k) => <ResourceManager name={k} />} />
          </Tab>
          <Tab eventKey="messages" title="Student messages">
            <Pills items={INBOXES} render={(k) => <InboxManager name={k} />} />
          </Tab>
          <Tab eventKey="email" title="Email"><EmailPanel /></Tab>
        </Tabs>
      </Container>
    </>
  )
}
