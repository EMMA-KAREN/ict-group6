import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function ModuleCard({ title, icon, text, to }) {
  return (
    <Card as={Link} to={to} className="module-card h-100 text-decoration-none text-dark shadow-sm">
      <Card.Body className="text-center">
        <i className={`bi ${icon} module-icon`}></i>
        <Card.Title className="mt-2 fs-6">{title}</Card.Title>
        <Card.Text className="small text-muted">{text}</Card.Text>
      </Card.Body>
    </Card>
  )
}
