// DUMMY DATA ONLY. contactId points to contacts in mockData.js, formId to forms.
export const units = [
  { id: 1, name: 'Web Design', department: 'Software Development', trainerIds: [2] },
  { id: 2, name: 'Programming Fundamentals', department: 'Software Development', trainerIds: [1] },
  { id: 3, name: 'Database Systems', department: 'Software Development', trainerIds: [1, 2] },
  { id: 4, name: 'ICT Support Skills', department: 'ICT', trainerIds: [] },
]

// Head of Department contact per department (fallback = Exams Officer, id 4)
export const hodByDept = { 'Software Development': 3 }

export const examGuides = {
  normal: [
    {
      id: 'n1', issue: 'Where and when do I sit my exam?',
      steps: ['Open Academics and check the Examination Timetable.', 'Note your unit, date, time and venue.', 'Arrive 30 minutes early with your student ID.'],
      location: 'Examinations office, Administration Block, Room 5', contactId: 4,
      note: 'If the venue or time changes, a notification is sent to every student by email.',
    },
    {
      id: 'n2', issue: 'How do I get my marks / results?',
      steps: ['Visit the Examinations department location below.', 'Normal exam results are issued immediately once released.', 'If a mark is missing, use the Missing Mark helper on this page.'],
      location: 'Examinations office, Administration Block, Room 5', contactId: 4,
    },
  ],
  retake: [
    {
      id: 'r1', issue: 'How do I apply for a retake?',
      steps: ['Download the Exam Retake Application form.', 'Fill it in and attach your fee payment receipt.', 'Submit it to the Examinations office.'],
      cost: 'Confirm the current retake fee per unit with the Examinations office.',
      location: 'Examinations office, Administration Block, Room 5', contactId: 4, formId: 2,
    },
    {
      id: 'r2', issue: 'Who do I ask for other exam enquiries?',
      steps: ['Visit the Examinations office or send an email.'],
      location: 'Examinations office, Administration Block, Room 5', contactId: 4,
    },
  ],
}

export const financeGuides = [
  {
    id: 'f1', issue: 'How do I pay fees online?',
    steps: ['Go to the institution online payment page.', 'Enter the course and your student details.', 'Pay using the payment method shown.', 'Keep the confirmation message as proof of payment.'],
    contactId: 7,
  },
  {
    id: 'f2', issue: 'How do I check my fee balance?',
    steps: ['Use the online payment procedure to view your balance.', 'Or visit the Finance office with your student ID.'],
    location: 'Finance office, Administration Block, Room 9', contactId: 7,
  },
  {
    id: 'f3', issue: 'My payment failed. Who do I contact?',
    steps: ['Keep the payment reference or message.', 'Email or visit the Finance Officer with the reference.'],
    contactId: 7,
  },
  {
    id: 'f4', issue: 'I cannot pay in one go.',
    steps: ['Download the Fee Payment Plan Request form.', 'Submit it to the Finance office.'],
    contactId: 7, formId: 3,
  },
]

export const feeStructure = [
  { course: 'Diploma in Software Development', perTerm: 'KES 25,000 (dummy)' },
  { course: 'Diploma in ICT', perTerm: 'KES 24,000 (dummy)' },
  { course: 'Certificate in Computer Studies', perTerm: 'KES 18,000 (dummy)' },
]

export const messGuides = [
  {
    id: 'm1', issue: 'How do I recharge my mess card?',
    steps: ['Go to the mess or Finance counter.', 'Pay the amount you want to load.', 'Ask for a receipt and confirm the new balance.'],
    contactId: 7,
  },
  {
    id: 'm2', issue: 'How do I check my balance or print a receipt?',
    steps: ['Ask for a balance check at the mess counter.', 'Request a printed receipt at the same counter.'],
    contactId: 5,
  },
  {
    id: 'm3', issue: 'I lost my mess card.',
    steps: ['Report immediately to Student Affairs so the card is deactivated.', 'The administrator deactivates the old card.', 'Download the Lost Mess Card Replacement form and submit it.'],
    contactId: 5, formId: 5,
  },
  {
    id: 'm4', issue: 'Food is not available. What do I do?',
    steps: ['Ask the mess supervisor when the food will be available.', 'Check the Notice Board for updates.'],
    contactId: 5,
  },
  {
    id: 'm5', issue: 'Food was unavailable after I paid. How do I reclaim my money?',
    steps: ['Keep your receipt or card balance record.', 'Report to Student Affairs and request a refund.'],
    contactId: 5,
  },
]

export const admissionGuides = [
  {
    id: 'a1', issue: 'How do I join the institution?',
    steps: ['Visit the Registry/Admissions office.', 'Get the entry requirements for your course.', 'Submit your application documents.'],
    location: 'Registry, Administration Block, Room 2', contactId: 8,
  },
  {
    id: 'a2', issue: 'How do I book accommodation?',
    steps: ['Download the Accommodation Booking Form.', 'Submit it to Student Affairs.'],
    location: 'Student Centre, Room 2', contactId: 5, formId: 4,
  },
  {
    id: 'a3', issue: 'Where do I find my school or department?',
    steps: ['Software Development and ICT: Block B and ICT Block.', 'Examinations, Finance and Registry: Administration Block.', 'Student Affairs: Student Centre.'],
    contactId: 8,
  },
]

export const ictGuides = [
  {
    id: 'i1', issue: 'How do I request ICT support?',
    steps: ['Download and fill the ICT Support Request Form.', 'Submit it at the ICT Helpdesk or email it.'],
    location: 'ICT Block, Room 3', contactId: 6, formId: 6,
  },
  {
    id: 'i2', issue: 'I cannot connect to the campus network.',
    steps: ['Confirm you are using the correct network name.', 'Restart your device and try again.', 'If it still fails, report to the ICT Helpdesk with your device and location.'],
    contactId: 6,
  },
  {
    id: 'i3', issue: 'A computer in the lab is faulty.',
    steps: ['Note the lab and the computer number.', 'Report it to the ICT Helpdesk.'],
    contactId: 6,
  },
]

export const academics = {
  requirements: [
    { course: 'Diploma in Software Development', requirement: 'KCSE C- and above (dummy)', duration: '2 years' },
    { course: 'Diploma in ICT', requirement: 'KCSE C- and above (dummy)', duration: '2 years' },
    { course: 'Certificate in Computer Studies', requirement: 'KCSE D+ and above (dummy)', duration: '1 year' },
  ],
  exams: [
    { unit: 'Web Design', date: '2026-11-03', time: '9:00 AM', venue: 'Lab 2' },
    { unit: 'Programming Fundamentals', date: '2026-11-05', time: '2:00 PM', venue: 'Hall A' },
    { unit: 'Database Systems', date: '2026-11-09', time: '9:00 AM', venue: 'Hall B' },
  ],
  calendar: [
    { event: 'Term opens', date: '2026-09-07' },
    { event: 'Mid-term break', date: '2026-10-19 to 2026-10-23' },
    { event: 'End of term exams', date: '2026-11-03 to 2026-11-13' },
    { event: 'Term closes', date: '2026-11-20' },
  ],
  assignments: [
    { unit: 'Web Design', assignment: 'Build a 3-page responsive website', due: '2026-10-30' },
    { unit: 'Database Systems', assignment: 'Design an ER diagram for a library', due: '2026-11-01' },
  ],
}
