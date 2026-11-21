// DUMMY DATA ONLY (brief section 7). Replaced by API calls to Express/MySQL later.
export const modules = [
  { title: 'Notice Board', icon: 'bi-megaphone', to: '/notices', text: 'Announcements and weekly schedules by department.' },
  { title: 'Academic Info', icon: 'bi-book', to: '/academics', text: 'Course requirements, calendar and exam timetable.' },
  { title: 'Forms & Documents', icon: 'bi-file-earmark-arrow-down', to: '/forms', text: 'Download the forms you need.' },
  { title: 'Contacts', icon: 'bi-telephone', to: '/contacts', text: 'Trainer emails, office numbers and consultation hours.' },
  { title: 'Exams', icon: 'bi-pencil-square', to: '/exams', text: 'Normal exams, retakes and missing marks.' },
  { title: 'Finance', icon: 'bi-cash-coin', to: '/finance', text: 'Fee structure and how to pay online.' },
  { title: 'Mess / Cafeteria', icon: 'bi-cup-hot', to: '/mess', text: 'Card recharge, balance and refunds.' },
  { title: 'Admissions', icon: 'bi-person-plus', to: '/admissions', text: 'How to join and accommodation.' },
  { title: 'ICT Support', icon: 'bi-headset', to: '/ict-support', text: 'Get help with ICT issues.' },
  { title: 'FAQs', icon: 'bi-question-circle', to: '/faqs', text: 'Quick answers to common questions.' },
  { title: 'Complaints', icon: 'bi-chat-left-text', to: '/complaints', text: 'Send a complaint to the right department.' },
  { title: 'Student Requests', icon: 'bi-send', to: '/requests', text: 'Submit a request online.' },
  { title: 'Track a Complaint', icon: 'bi-search-heart', to: '/track', text: 'Check the progress of your complaint or request.' },
]

export const departments = [
  'Examinations', 'ICT', 'Software Development', 'Student Affairs',
  'Registry/Admissions', 'Finance', 'Library',
]

export const notices = [
  { id: 1, title: 'End of Term Exam Timetable Released', department: 'Examinations', date: '2026-10-15', type: 'Notice', body: 'The end of term examination timetable is now available. Check your exam venue and time, and report 30 minutes early.' },
  { id: 2, title: 'ICT Lab Maintenance on Saturday', department: 'ICT', date: '2026-10-14', type: 'Notice', body: 'Computer laboratories will be closed from 8am to 1pm for routine maintenance.' },
  { id: 3, title: 'Weekly Class Schedule - Week 7', department: 'Software Development', date: '2026-10-12', type: 'Weekly schedule', body: 'The updated weekly class schedule for Software Development classes has been uploaded.' },
  { id: 4, title: 'Missing Marks Reporting Window', department: 'Examinations', date: '2026-10-10', type: 'Notice', body: 'Students with missing marks should report to their unit trainer first, then to the Head of Department if unresolved.' },
  { id: 5, title: 'Student Affairs Open Day', department: 'Student Affairs', date: '2026-10-09', type: 'Notice', body: 'Meet the Student Affairs team to learn about clubs, welfare support and accommodation.' },
  { id: 6, title: 'Fee Balance Statements Available', department: 'Finance', date: '2026-10-08', type: 'Notice', body: 'Students can check their fee balance at the Finance office or through the online payment procedure.' },
  { id: 7, title: 'New Intake Registration', department: 'Registry/Admissions', date: '2026-10-05', type: 'Notice', body: 'Registration for the new intake is ongoing. Visit the Registry for requirements and guidance.' },
]

export const forms = [
  { id: 1, name: 'Missing Marks Request Form', department: 'Examinations', description: 'Use when a mark is missing from your results.', file: '#' },
  { id: 2, name: 'Exam Retake Application', department: 'Examinations', description: 'Apply to retake a failed unit.', file: '#' },
  { id: 3, name: 'Fee Payment Plan Request', department: 'Finance', description: 'Request to pay fees in instalments.', file: '#' },
  { id: 4, name: 'Accommodation Booking Form', department: 'Student Affairs', description: 'Book hostel accommodation.', file: '#' },
  { id: 5, name: 'Lost Mess Card Replacement', department: 'Student Affairs', description: 'Request a replacement for a lost cafeteria card.', file: '#' },
  { id: 6, name: 'ICT Support Request Form', department: 'ICT', description: 'Request ICT help or report a fault.', file: '#' },
  { id: 7, name: 'Course Transfer Form', department: 'Registry/Admissions', description: 'Request to change course.', file: '#' },
]

// Dummy staff only - no real people
export const contacts = [
  { id: 1, name: 'Trainer A (dummy)', role: 'Unit Trainer - Programming', department: 'Software Development', email: 'trainer.a@example.ac.ke', office: 'Block B, Room 12', hours: 'Mon & Wed, 2pm - 4pm' },
  { id: 2, name: 'Trainer B (dummy)', role: 'Unit Trainer - Web Design', department: 'Software Development', email: 'trainer.b@example.ac.ke', office: 'Block B, Room 14', hours: 'Tue & Thu, 10am - 12pm' },
  { id: 3, name: 'HOD Software Dev (dummy)', role: 'Head of Department', department: 'Software Development', email: 'hod.sd@example.ac.ke', office: 'Block B, Room 1', hours: 'Daily, 8am - 10am' },
  { id: 4, name: 'Exams Officer (dummy)', role: 'Examinations Officer', department: 'Examinations', email: 'exams@example.ac.ke', office: 'Administration Block, Room 5', hours: 'Mon - Fri, 8am - 5pm' },
  { id: 5, name: 'Student Affairs Officer (dummy)', role: 'Student Welfare', department: 'Student Affairs', email: 'studentaffairs@example.ac.ke', office: 'Student Centre, Room 2', hours: 'Mon - Fri, 8am - 5pm' },
  { id: 6, name: 'ICT Helpdesk (dummy)', role: 'ICT Support', department: 'ICT', email: 'helpdesk@example.ac.ke', office: 'ICT Block, Room 3', hours: 'Mon - Fri, 8am - 5pm' },
  { id: 7, name: 'Finance Officer (dummy)', role: 'Fees and Payments', department: 'Finance', email: 'finance@example.ac.ke', office: 'Administration Block, Room 9', hours: 'Mon - Fri, 8am - 4pm' },
  { id: 8, name: 'Registrar Office (dummy)', role: 'Admissions', department: 'Registry/Admissions', email: 'registry@example.ac.ke', office: 'Administration Block, Room 2', hours: 'Mon - Fri, 8am - 5pm' },
]

export const faqs = [
  { id: 1, service: 'Exams', question: 'What should I do if my mark is missing?', answer: 'Search your unit, select your trainer and contact them first. If you are not directed to a contact, go to your Head of Department. You can also visit the Examinations office.' },
  { id: 2, service: 'Exams', question: 'How do I know if my exam venue or time changes?', answer: 'Changes are sent to every student by email and posted on the Notice Board.' },
  { id: 3, service: 'Exams', question: 'How do I apply for a retake?', answer: 'Download the Exam Retake Application form, fill it in and take it to the Examinations office. Ask the office for the retake fee.' },
  { id: 4, service: 'Finance', question: 'How do I check my fee balance?', answer: 'Follow the online payment procedure to view your balance, or visit the Finance office.' },
  { id: 5, service: 'Finance', question: 'Who do I contact if my payment fails?', answer: 'Contact the Finance Officer by email or visit the Finance office with your payment reference.' },
  { id: 6, service: 'Mess', question: 'How do I recharge my mess card?', answer: 'Recharge your card at the Finance or mess counter, then check your balance and print a receipt there.' },
  { id: 7, service: 'Mess', question: 'What if I lose my mess card?', answer: 'Report to Student Affairs. The administrator will deactivate the lost card and issue a replacement.' },
  { id: 8, service: 'Mess', question: 'What if food is unavailable after I paid?', answer: 'Report to the mess supervisor to see when food will be available, or request a refund of your money through Student Affairs.' },
  { id: 9, service: 'Admissions', question: 'How do I join the institution?', answer: 'Visit the Registry/Admissions office for requirements and application guidance.' },
  { id: 10, service: 'Admissions', question: 'How do I book accommodation?', answer: 'Download the Accommodation Booking Form and submit it to Student Affairs.' },
  { id: 11, service: 'ICT Support', question: 'How do I request ICT support?', answer: 'Use the ICT Support page or visit the ICT Helpdesk with the details of the problem.' },
  { id: 12, service: 'Complaints', question: 'Who do I send a complaint to?', answer: 'Send it to the department concerned. If you are unsure, send it to Student Affairs and it will be directed correctly.' },
]
