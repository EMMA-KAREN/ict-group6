import { Container } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import GuideSection from '../components/GuideSection'

export default function Mess() {
  return (
    <>
      <PageHeader title="Mess / Cafeteria" subtitle="Card recharge, balance, lost cards and refunds" icon="bi-cup-hot" />
      <Container className="mt-4"><GuideSection section="mess" /></Container>
    </>
  )
}
