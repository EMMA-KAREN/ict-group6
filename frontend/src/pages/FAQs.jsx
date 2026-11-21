import { useState } from 'react'
import { Container, Accordion, Button } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { useData } from '../context/DataContext'


export default function FAQs() {
  const { faqs } = useData()
  const services = ['All', ...new Set(faqs.map((f) => f.service))]
  const [service, setService] = useState('All')
  const list = faqs.filter((f) => service === 'All' || f.service === service)

  return (
    <>
      <PageHeader title="Frequently Asked Questions" subtitle="Quick answers, grouped by service" icon="bi-question-circle" />
      <Container className="mt-4">
        <div className="d-flex flex-wrap gap-2 mb-4">
          {services.map((s) => (
            <Button key={s} size="sm" className={service === s ? 'btn-brand' : ''} variant={service === s ? undefined : 'outline-success'} onClick={() => setService(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Accordion>
          {list.map((f) => (
            <Accordion.Item eventKey={String(f.id)} key={f.id}>
              <Accordion.Header>{f.question}</Accordion.Header>
              <Accordion.Body>{f.answer}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </>
  )
}
