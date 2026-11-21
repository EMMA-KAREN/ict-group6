import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

const NAMES = [
  'notices', 'forms', 'contacts', 'faqs',
  'fees', 'units', 'guides',
  'course_requirements', 'exam_timetable', 'academic_calendar', 'assignments',
]
const EMPTY = Object.fromEntries(NAMES.map((n) => [n, []]))

export function DataProvider({ children }) {
  const { token } = useAuth()
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all(NAMES.map((n) => api('/' + n)))
      .then((lists) => {
        if (!alive) return
        setData(Object.fromEntries(NAMES.map((n, i) => [n, lists[i]])))
        setError('')
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  // Admin actions: each one calls the Flask API, then updates the screen with the saved row.
  const add = async (name, item) => {
    const row = await api('/' + name, { method: 'POST', body: item, token })
    setData((d) => ({ ...d, [name]: name === 'notices' ? [row, ...d[name]] : [...d[name], row] }))
    return row
  }
  const update = async (name, id, item) => {
    const row = await api(`/${name}/${id}`, { method: 'PUT', body: item, token })
    setData((d) => ({ ...d, [name]: d[name].map((x) => (x.id === id ? row : x)) }))
  }
  // Form files (PDF / Word) are uploaded separately from the form's text fields
  const uploadFormFile = async (id, file) => {
    const fd = new FormData()
    fd.append('file', file)
    const row = await api(`/admin/forms/${id}/file`, { method: 'POST', body: fd, token })
    setData((d) => ({ ...d, forms: d.forms.map((x) => (x.id === id ? row : x)) }))
    return row
  }
  const removeFormFile = async (id) => {
    const row = await api(`/admin/forms/${id}/file`, { method: 'DELETE', token })
    setData((d) => ({ ...d, forms: d.forms.map((x) => (x.id === id ? row : x)) }))
    return row
  }
  const remove = async (name, id) => {
    await api(`/${name}/${id}`, { method: 'DELETE', token })
    // Deleting a contact or form clears its link in guides (the database sets it to empty), so reload guides
    if (name === 'contacts' || name === 'forms') {
      const guides = await api('/guides')
      setData((d) => ({ ...d, [name]: d[name].filter((x) => x.id !== id), guides }))
    } else {
      setData((d) => ({ ...d, [name]: d[name].filter((x) => x.id !== id) }))
    }
  }

  return (
    <DataContext.Provider value={{ ...data, loading, error, add, update, remove, uploadFormFile, removeFormFile }}>
      {children}
    </DataContext.Provider>
  )
}
