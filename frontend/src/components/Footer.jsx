import { Container } from 'react-bootstrap'

export default function Footer() {
  return (
    <footer className="footer py-4 mt-5">
      <Container className="text-center small">
        &copy; {new Date().getFullYear()} KSTVET Digital Student Information &amp; Self-Service Portal | Group 6
      </Container>
    </footer>
  )
}
