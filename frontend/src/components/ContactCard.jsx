import { Card } from 'react-bootstrap'

export default function ContactCard({ c }) {
  if (!c) return null
  return (
    <Card className="border-success-subtle">
      <Card.Body className="py-2">
        <div className="fw-semibold">{c.name}</div>
        <div className="text-muted small mb-1">{c.role} &middot; {c.department}</div>
        <div className="small"><i className="bi bi-envelope me-2"></i><a href={`mailto:${c.email}`}>{c.email}</a></div>
        <div className="small"><i className="bi bi-geo-alt me-2"></i>{c.office}</div>
        <div className="small"><i className="bi bi-clock me-2"></i>{c.hours}</div>
      </Card.Body>
    </Card>
  )
}
