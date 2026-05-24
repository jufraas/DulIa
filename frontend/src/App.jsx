import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppCoachShell from './components/coach/AppCoachShell'
import AboutPage from './pages/AboutPage'
import ConstruccionPage from './pages/ConstruccionPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
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
      <AppCoachShell>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/comenzar" element={<OnboardingPage />} />
          <Route path="/resultados" element={<ResultsPage />} />
          <Route path="/vacantes" element={<VacanciesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/construccion" element={<ConstruccionPage />} />
        </Routes>
      </AppCoachShell>
    </BrowserRouter>
  )
}

export default App
