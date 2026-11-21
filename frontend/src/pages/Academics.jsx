import { Container, Tabs, Tab, Table } from 'react-bootstrap'
import PageHeader from '../components/PageHeader'
import { useData } from '../context/DataContext'

function Tbl({ head, rows }) {
  return (
    <div className="table-responsive shadow-sm bg-white rounded">
      <Table className="mb-0">
        <thead className="table-light"><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
          {rows.length === 0 && <tr><td colSpan={head.length} className="text-center text-muted py-3">Nothing listed yet.</td></tr>}
        </tbody>
      </Table>
    </div>
  )
}

export default function Academics() {
  const { course_requirements, exam_timetable, academic_calendar, assignments } = useData()
  return (
    <>
      <PageHeader title="Academic Information" subtitle="Course requirements, timetable, calendar and assignments" icon="bi-book" />
      <Container className="mt-4">
        <Tabs defaultActiveKey="req" className="mb-3">
          <Tab eventKey="req" title="Course requirements">
            <Tbl head={['Course', 'Entry requirement', 'Duration']} rows={course_requirements.map((r) => [r.course, r.requirement, r.duration])} />
          </Tab>
          <Tab eventKey="exam" title="Exam timetable">
            <Tbl head={['Unit', 'Date', 'Time', 'Venue']} rows={exam_timetable.map((r) => [r.unit, r.exam_date, r.exam_time, r.venue])} />
          </Tab>
          <Tab eventKey="cal" title="Academic calendar">
            <Tbl head={['Event', 'Date']} rows={academic_calendar.map((r) => [r.event, r.period])} />
          </Tab>
          <Tab eventKey="asg" title="Assignments">
            <Tbl head={['Unit', 'Assignment', 'Due']} rows={assignments.map((r) => [r.unit, r.assignment, r.due_date])} />
          </Tab>
        </Tabs>
      </Container>
    </>
  )
}
