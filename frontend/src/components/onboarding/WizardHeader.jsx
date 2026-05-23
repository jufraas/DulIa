import { Link } from 'react-router-dom'
import DuliaLogo from '../brand/DuliaLogo'
import Button from '../ui/Button'
import Container from '../ui/Container'
import WizardProgress from './WizardProgress'

/**
 * @owner migue
 * @param {{ progress: number, step: number, total: number, onCancel: () => void }} props
 */
export default function WizardHeader({ progress, step, total, onCancel }) {
  return (
    <header className="dh">
      <Container className="dh-inner">
        <Link to="/">
          <DuliaLogo />
        </Link>
        <WizardProgress value={progress} step={step} total={total} />
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </Container>
    </header>
  )
}
