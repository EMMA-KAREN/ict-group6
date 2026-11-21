import { Accordion, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ContactCard from './ContactCard'
import { useData } from '../context/DataContext'

export default function GuideSection({ section }) {
  const { guides, contacts, forms, loading } = useData()
  const list = guides.filter((g) => g.section === section)

  if (list.length === 0) {
    return <p className="text-muted">{loading ? 'Loading...' : 'No guides have been added yet.'}</p>
  }

  return (
    <Accordion>
      {list.map((g) => {
        const contact = contacts.find((c) => c.id === g.contact_id)
        const form = forms.find((f) => f.id === g.form_id)
        const steps = (g.steps || '').split('\n').map((s) => s.trim()).filter(Boolean)
        return (
          <Accordion.Item eventKey={String(g.id)} key={g.id}>
            <Accordion.Header>{g.issue}</Accordion.Header>
            <Accordion.Body>
              <ol className="mb-3">
                {steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              {g.cost && <p className="small"><i className="bi bi-cash me-2"></i>{g.cost}</p>}
              {g.location && <p className="small"><i className="bi bi-geo-alt me-2"></i><strong>Where to go:</strong> {g.location}</p>}
              {form && (
                <p className="small">
                  <i className="bi bi-file-earmark-arrow-down me-2"></i>
                  Form needed: <Link to="/forms">{form.name}</Link>
                </p>
              )}
              {g.note && <Alert variant="info" className="py-2 small">{g.note}</Alert>}
              {contact && (
                <>
                  <div className="small text-muted mb-1">Who to contact</div>
                  <ContactCard c={contact} />
                </>
              )}
            </Accordion.Body>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}
