import { Container, ListGroup, Badge, Alert } from 'react-bootstrap'
import { useSearchParams, Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import SearchBar from '../components/SearchBar'
import { searchAll } from '../utils/search'
import { useData } from '../context/DataContext'

const PAGES = {
  exams_normal: '/exams', exams_retake: '/exams', finance: '/finance',
  mess: '/mess', admissions: '/admissions', ict: '/ict-support',
}

function Section({ title, count, children }) {
  if (!count) return null
  return (
    <div className="mb-4">
      <h2 className="h5">{title} <Badge bg="secondary">{count}</Badge></h2>
      <ListGroup className="shadow-sm">{children}</ListGroup>
    </div>
  )
}

export default function SearchResults() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const data = useData()
  const r = searchAll(q, data)
  const total = r.notices.length + r.forms.length + r.contacts.length + r.faqs.length + r.guides.length

  return (
    <>
      <PageHeader title="Search" subtitle={q ? `Results for "${q}"` : 'Type a keyword'} icon="bi-search" />
      <Container className="mt-4">
        <div className="mb-4"><SearchBar /></div>

        {q && total === 0 && (
          <Alert variant="warning">
            No results found. Try another keyword, or <Link to="/contacts">find who to contact</Link>.
          </Alert>
        )}

        <Section title="Answers (FAQs)" count={r.faqs.length}>
          {r.faqs.map((f) => (
            <ListGroup.Item key={f.id}>
              <div className="fw-semibold">{f.question}</div>
              <div className="small text-muted">{f.answer}</div>
            </ListGroup.Item>
          ))}
        </Section>

        <Section title="Step-by-step guides" count={r.guides.length}>
          {r.guides.map((g) => (
            <ListGroup.Item key={g.id} as={Link} to={PAGES[g.section] || '/'} action>
              <div className="fw-semibold">{g.issue}</div>
              <small className="text-muted">{(g.steps || '').split('\n')[0]}</small>
            </ListGroup.Item>
          ))}
        </Section>

        <Section title="Notices" count={r.notices.length}>
          {r.notices.map((n) => (
            <ListGroup.Item key={n.id} as={Link} to="/notices" action>
              <div className="fw-semibold">{n.title}</div>
              <small className="text-muted">{n.department} &middot; {n.date}</small>
            </ListGroup.Item>
          ))}
        </Section>

        <Section title="Forms" count={r.forms.length}>
          {r.forms.map((f) => (
            <ListGroup.Item key={f.id} as={Link} to="/forms" action>
              <div className="fw-semibold">{f.name}</div>
              <small className="text-muted">{f.description}</small>
            </ListGroup.Item>
          ))}
        </Section>

        <Section title="Contacts" count={r.contacts.length}>
          {r.contacts.map((c) => (
            <ListGroup.Item key={c.id} as={Link} to="/contacts" action>
              <div className="fw-semibold">{c.name}</div>
              <small className="text-muted">{c.role} &middot; {c.office}</small>
            </ListGroup.Item>
          ))}
        </Section>
      </Container>
    </>
  )
}
