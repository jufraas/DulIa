import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AboutPage from './pages/AboutPage'
import OnboardingPage from './pages/OnboardingPage'
import ResultsPage from './pages/ResultsPage'
import VacanciesPage from './pages/VacanciesPage'
import WelcomePage from './pages/WelcomePage'
import { hydrateSession } from './services/sessionHydration'

/**
 * Flujo kit ReBrand:
 * 01 Landing (/) → 02 Wizard (/comenzar) → 03 Results (/resultados) → 04 Vacancies (/vacantes)
 */
function App() {
  useEffect(() => {
    hydrateSession()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/comenzar" element={<OnboardingPage />} />
        <Route path="/resultados" element={<ResultsPage />} />
        <Route path="/vacantes" element={<VacanciesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
