import { Navbar, Nav, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

export default function AppNavbar() {
  return (
    <Navbar expand="lg" variant="dark" className="bg-brand" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          <i className="bi bi-mortarboard-fill me-2"></i>KSTVET Student Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/notices">Notices</Nav.Link>
            <Nav.Link as={NavLink} to="/forms">Forms</Nav.Link>
            <Nav.Link as={NavLink} to="/contacts">Contacts</Nav.Link>
            <Nav.Link as={NavLink} to="/faqs">FAQs</Nav.Link>
            <Nav.Link as={NavLink} to="/admin/login" className="text-warning">
              <i className="bi bi-lock me-1"></i>Admin
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
