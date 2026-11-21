import { Container, Tabs, Tab } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import GuideSection from '../components/GuideSection'
import MissingMarkHelper from '../components/MissingMarkHelper'

export default function Exams() {
  return (
    <>
      <PageHeader title="Exams" subtitle="Normal exams, retakes and missing marks" icon="bi-pencil-square" />
      <Container className="mt-4">
        <Tabs defaultActiveKey="missing" className="mb-3">
          <Tab eventKey="missing" title="Missing mark"><MissingMarkHelper /></Tab>
          <Tab eventKey="normal" title="Normal exam"><GuideSection section="exams_normal" /></Tab>
          <Tab eventKey="retake" title="Retake"><GuideSection section="exams_retake" /></Tab>
        </Tabs>
      </Container>
    </>
  )
}
