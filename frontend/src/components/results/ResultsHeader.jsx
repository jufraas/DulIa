import { Link } from 'react-router-dom'
import DuliaLogo from '../brand/DuliaLogo'
import Button from '../ui/Button'
import Container from '../ui/Container'

/**
 * @owner joufra
 */
export default function ResultsHeader() {
  return (
    <header className="dh">
      <Container className="dh-inner">
        <Link to="/">
          <DuliaLogo />
        </Link>
        <nav className="dh-nav hidden md:flex" aria-label="Resultados">
          <Link to="/comenzar">Editar perfil</Link>
        </nav>
        <Link to="/comenzar">
          <Button variant="ghost" size="sm">
            Editar perfil
          </Button>
        </Link>
      </Container>
    </header>
  )
}
