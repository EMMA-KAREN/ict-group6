import { Container } from 'react-bootstrap'

export default function PageHeader({ title, subtitle, icon }) {
  return (
    <section className="hero py-4">
      <Container>
        <h1 className="h2 mb-1">{icon && <i className={`bi ${icon} me-2`}></i>}{title}</h1>
        {subtitle && <p className="mb-0 opacity-75">{subtitle}</p>}
      </Container>
    </section>
  )
}
