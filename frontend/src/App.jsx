import { Routes, Route } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import { useData } from './context/DataContext'
import AppNavbar from './components/AppNavbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Notices from './pages/Notices'
import Forms from './pages/Forms'
import Contacts from './pages/Contacts'
import FAQs from './pages/FAQs'
import SearchResults from './pages/SearchResults'
import Exams from './pages/Exams'
import Finance from './pages/Finance'
import Mess from './pages/Mess'
import Admissions from './pages/Admissions'
import IctSupport from './pages/IctSupport'
import Academics from './pages/Academics'
import Complaints from './pages/Complaints'
import Requests from './pages/Requests'
import Track from './pages/Track'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './admin/ProtectedRoute'

export default function App() {
  const { error } = useData()
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1">
        {error && <Alert variant="danger" className="m-3">{error}</Alert>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/mess" element={<Mess />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/ict-support" element={<IctSupport />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/track" element={<Track />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<div className="container mt-5"><h3>Page not found</h3></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
