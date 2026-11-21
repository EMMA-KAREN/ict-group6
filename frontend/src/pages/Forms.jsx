import { useState } from 'react'
import { Container, Table, Form, Button, Modal } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { useData } from '../context/DataContext'
import { API } from '../api'

export default function Forms() {
  const { forms } = useData()
  const [q, setQ] = useState('')
  const [viewing, setViewing] = useState(null)

  const list = forms.filter((f) =>
    (f.name + f.description + f.department).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      <PageHeader title="Forms & Documents" subtitle="View or download the form you need" icon="bi-file-earmark-arrow-down" />
      <Container className="mt-4">
        <Form.Control className="mb-3" placeholder="Search forms..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="table-responsive shadow-sm bg-white rounded">
          <Table hover className="mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Form</th><th>Department</th><th>Description</th><th className="text-end">File</th></tr>
            </thead>
            <tbody>
              {list.map((f) => (
                <tr key={f.id}>
                  <td className="fw-semibold">{f.name}</td>
                  <td>{f.department}</td>
                  <td className="text-muted small">{f.description}</td>
                  <td className="text-end text-nowrap">
                    {f.has_file ? (
                      <>
                        {f.has_preview ? (
                          <Button size="sm" variant="outline-success" className="me-1" onClick={() => setViewing(f)}>
                            <i className="bi bi-eye me-1"></i>View
                          </Button>
                        ) : null}
                        <Button as="a" href={`${API}/forms/${f.id}/download`} size="sm" className="btn-brand">
                          <i className="bi bi-download me-1"></i>Download
                        </Button>
                      </>
                    ) : (
                      <span className="small text-muted">File not uploaded yet</span>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">No forms found.</td></tr>}
            </tbody>
          </Table>
        </div>
      </Container>

      <Modal show={!!viewing} onHide={() => setViewing(null)} size="xl" centered>
        {viewing && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="h5">{viewing.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              <iframe title={viewing.name} src={`${API}/forms/${viewing.id}/view`} style={{ width: '100%', height: '75vh', border: 0 }} />
            </Modal.Body>
            <Modal.Footer>
              <Button as="a" href={`${API}/forms/${viewing.id}/view`} target="_blank" rel="noreferrer" variant="outline-secondary">Open in a new tab</Button>
              <Button as="a" href={`${API}/forms/${viewing.id}/download`} className="btn-brand"><i className="bi bi-download me-1"></i>Download</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  )
}
