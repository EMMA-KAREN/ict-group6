import { Container } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import GuideSection from '../components/GuideSection'

export default function IctSupport() {
  return (
    <>
      <PageHeader title="ICT Support" subtitle="Get help with ICT problems" icon="bi-headset" />
      <Container className="mt-4"><GuideSection section="ict" /></Container>
    </>
  )
}
