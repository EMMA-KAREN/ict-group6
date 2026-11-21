import { departments } from '../data/mockData'

const today = () => new Date().toISOString().slice(0, 10)
const services = ['Exams', 'Finance', 'Mess', 'Admissions', 'ICT Support', 'Complaints']
const sections = [
  { value: 'exams_normal', label: 'Exams: normal exam' },
  { value: 'exams_retake', label: 'Exams: retake' },
  { value: 'finance', label: 'Finance' },
  { value: 'mess', label: 'Mess / Cafeteria' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'ict', label: 'ICT Support' },
]

// field types: text, email, date, textarea, select, refselect (pick a contact/form), multicontacts
export const resources = {
  notices: {
    label: 'Notices',
    columns: ['title', 'department', 'type', 'date'],
    defaults: () => ({ title: '', department: '', type: 'Notice', date: today(), body: '' }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'department', label: 'Department', type: 'select', options: departments },
      { key: 'type', label: 'Type', type: 'select', options: ['Notice', 'Weekly schedule'] },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'body', label: 'Details', type: 'textarea' },
    ],
  },
  forms: {
    label: 'Forms',
    columns: ['name', 'department', 'file_name'],
    defaults: () => ({ name: '', department: '', description: '' }),
    fields: [
      { key: 'name', label: 'Form name', type: 'text' },
      { key: 'department', label: 'Department', type: 'select', options: departments },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  contacts: {
    label: 'Contacts',
    columns: ['name', 'role', 'department', 'email'],
    defaults: () => ({ name: '', role: '', department: '', email: '', office: '', hours: '' }),
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'text', hint: 'Use "Head of Department" for the person the Missing Mark helper should send students to.' },
      { key: 'department', label: 'Department', type: 'select', options: departments },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'office', label: 'Office / room', type: 'text' },
      { key: 'hours', label: 'Consultation hours', type: 'text' },
    ],
  },
  faqs: {
    label: 'FAQs',
    columns: ['service', 'question'],
    defaults: () => ({ service: '', question: '', answer: '' }),
    fields: [
      { key: 'service', label: 'Service', type: 'select', options: services },
      { key: 'question', label: 'Question', type: 'text' },
      { key: 'answer', label: 'Answer', type: 'textarea' },
    ],
  },
  guides: {
    label: 'Guides',
    columns: ['section', 'issue'],
    defaults: () => ({ section: '', issue: '', steps: '', cost: '', location: '', note: '', contact_id: '', form_id: '' }),
    fields: [
      { key: 'section', label: 'Page', type: 'select', options: sections },
      { key: 'issue', label: 'Problem or question', type: 'text' },
      { key: 'steps', label: 'Steps', type: 'textarea', hint: 'Write one step per line.' },
      { key: 'cost', label: 'Cost (optional)', type: 'text', required: false },
      { key: 'location', label: 'Where to go (optional)', type: 'text', required: false },
      { key: 'note', label: 'Note (optional)', type: 'textarea', required: false },
      { key: 'contact_id', label: 'Who to contact (optional)', type: 'refselect', source: 'contacts', required: false },
      { key: 'form_id', label: 'Form needed (optional)', type: 'refselect', source: 'forms', required: false },
    ],
  },
  units: {
    label: 'Units',
    columns: ['name', 'department'],
    defaults: () => ({ name: '', department: '', trainer_ids: '' }),
    fields: [
      { key: 'name', label: 'Unit name', type: 'text' },
      { key: 'department', label: 'Department', type: 'select', options: departments },
      { key: 'trainer_ids', label: 'Trainers (shown in the Missing Mark helper)', type: 'multicontacts', required: false },
    ],
  },
  fees: {
    label: 'Fees',
    columns: ['course', 'per_term'],
    defaults: () => ({ course: '', per_term: '' }),
    fields: [
      { key: 'course', label: 'Course', type: 'text' },
      { key: 'per_term', label: 'Fee per term', type: 'text' },
    ],
  },
  course_requirements: {
    label: 'Course requirements',
    columns: ['course', 'requirement', 'duration'],
    defaults: () => ({ course: '', requirement: '', duration: '' }),
    fields: [
      { key: 'course', label: 'Course', type: 'text' },
      { key: 'requirement', label: 'Entry requirement', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'text' },
    ],
  },
  exam_timetable: {
    label: 'Exam timetable',
    columns: ['unit', 'exam_date', 'exam_time', 'venue'],
    defaults: () => ({ unit: '', exam_date: today(), exam_time: '', venue: '' }),
    fields: [
      { key: 'unit', label: 'Unit', type: 'text' },
      { key: 'exam_date', label: 'Date', type: 'date' },
      { key: 'exam_time', label: 'Time', type: 'text' },
      { key: 'venue', label: 'Venue', type: 'text' },
    ],
  },
  academic_calendar: {
    label: 'Calendar events',
    columns: ['event', 'period'],
    defaults: () => ({ event: '', period: '' }),
    fields: [
      { key: 'event', label: 'Event', type: 'text' },
      { key: 'period', label: 'Date or period', type: 'text', hint: 'For example 2026-11-03 or 2026-11-03 to 2026-11-13' },
    ],
  },
  assignments: {
    label: 'Assignments',
    columns: ['unit', 'assignment', 'due_date'],
    defaults: () => ({ unit: '', assignment: '', due_date: today() }),
    fields: [
      { key: 'unit', label: 'Unit', type: 'text' },
      { key: 'assignment', label: 'Assignment', type: 'text' },
      { key: 'due_date', label: 'Due date', type: 'date' },
    ],
  },
}
