import { Container, Table } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import GuideSection from '../components/GuideSection'
import { useData } from '../context/DataContext'

export default function Finance() {
  const { fees } = useData()
  return (
    <>
      <PageHeader title="Finance" subtitle="Fee structure, online payment and balances" icon="bi-cash-coin" />
      <Container className="mt-4">
        <h2 className="h5">Fee structure</h2>
        <div className="table-responsive shadow-sm bg-white rounded mb-4">
          <Table className="mb-0">
            <thead className="table-light"><tr><th>Course</th><th>Fee per term</th></tr></thead>
            <tbody>
              {fees.map((f) => <tr key={f.id}><td>{f.course}</td><td>{f.per_term}</td></tr>)}
              {fees.length === 0 && <tr><td colSpan={2} className="text-muted text-center py-3">No fees listed yet.</td></tr>}
            </tbody>
          </Table>
        </div>
        <h2 className="h5">Payments and balances</h2>
        <GuideSection section="finance" />
      </Container>
    </>
  )
}
