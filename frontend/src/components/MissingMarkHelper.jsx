import { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ContactCard from './ContactCard'
import { useData } from '../context/DataContext'

export default function MissingMarkHelper() {
  const { contacts, units } = useData()
  const [unitId, setUnitId] = useState('')
  const [trainerId, setTrainerId] = useState('')
  const [escalate, setEscalate] = useState(false)

  const unit = units.find((u) => u.id === Number(unitId))
  const trainers = unit
    ? (unit.trainer_ids || '').split(',').filter(Boolean).map(Number)
        .map((id) => contacts.find((c) => c.id === id)).filter(Boolean)
    : []
  const trainer = contacts.find((c) => c.id === Number(trainerId))
  // Head of Department of the unit's department; if none is listed, the Examinations officer
  const hod =
    (unit && contacts.find((c) => c.department === unit.department && /head of department/i.test(c.role))) ||
    contacts.find((c) => /examinations officer/i.test(c.role))

  const reset = () => { setUnitId(''); setTrainerId(''); setEscalate(false) }

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <h2 className="h5">Missing mark helper</h2>
        <p className="text-muted small">Select your unit and your trainer to see who to contact.</p>

        <Form.Group className="mb-3">
          <Form.Label>1. Select your unit</Form.Label>
          <Form.Select value={unitId} onChange={(e) => { setUnitId(e.target.value); setTrainerId(''); setEscalate(false) }}>
            <option value="">Choose a unit...</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Form.Select>
        </Form.Group>

        {unit && trainers.length > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>2. Select your trainer</Form.Label>
            <Form.Select value={trainerId} onChange={(e) => { setTrainerId(e.target.value); setEscalate(false) }}>
              <option value="">Choose your trainer...</option>
              {trainers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Form.Select>
          </Form.Group>
        )}

        {unit && trainers.length === 0 && (
          <Alert variant="warning" className="small">
            No trainer is listed for this unit, so contact the Head of Department.
          </Alert>
        )}

        {trainer && !escalate && (
          <>
            <div className="small text-muted mb-1">Contact your trainer first</div>
            <ContactCard c={trainer} />
            <Button variant="link" className="px-0 mt-2" onClick={() => setEscalate(true)}>
              My trainer did not help or is not listed
            </Button>
          </>
        )}

        {unit && (escalate || trainers.length === 0) && (
          <>
            <div className="small text-muted mb-1 mt-2">Head of Department</div>
            <ContactCard c={hod} />
          </>
        )}

        {unit && (
          <div className="mt-3 small">
            You can also submit the <Link to="/forms">Missing Marks Request Form</Link> at the Examinations office.
          </div>
        )}

        {(unitId || trainerId) && (
          <Button variant="outline-secondary" size="sm" className="mt-3" onClick={reset}>Start again</Button>
        )}
      </Card.Body>
    </Card>
  )
}
