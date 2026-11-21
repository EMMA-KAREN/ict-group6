const has = (text, q) => (text || '').toLowerCase().includes(q)

export function searchAll(query, { notices, forms, contacts, faqs, guides }) {
  const q = query.trim().toLowerCase()
  if (!q) return { notices: [], forms: [], contacts: [], faqs: [], guides: [] }
  return {
    notices: notices.filter((n) => has(n.title, q) || has(n.body, q) || has(n.department, q)),
    forms: forms.filter((f) => has(f.name, q) || has(f.description, q) || has(f.department, q)),
    contacts: contacts.filter((c) => has(c.name, q) || has(c.role, q) || has(c.department, q)),
    faqs: faqs.filter((f) => has(f.question, q) || has(f.answer, q) || has(f.service, q)),
    guides: guides.filter((g) => has(g.issue, q) || has(g.steps, q) || has(g.location, q) || has(g.note, q)),
  }
}
