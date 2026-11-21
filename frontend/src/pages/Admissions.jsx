import { Container } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import GuideSection from '../components/GuideSection'
import { admissionGuides } from '../data/guides'

export default function Admissions() {
  return (
    <>
      <PageHeader title="Admissions" subtitle="How to join, where to go and accommodation" icon="bi-person-plus" />
      <Container className="mt-4"><GuideSection guides={admissionGuides} /></Container>
            <Container className="mt-4"><GuideSection section="admissions" /></Container>
    </>
  )
}
