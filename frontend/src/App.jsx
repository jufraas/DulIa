import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AboutPage from './pages/AboutPage'
import ConstruccionPage from './pages/ConstruccionPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ResultsPage from './pages/ResultsPage'
import VacanciesPage from './pages/VacanciesPage'
import WelcomePage from './pages/WelcomePage'
import AuthProvider from './context/AuthProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/comenzar" element={<OnboardingPage />} />
          <Route path="/resultados" element={<ResultsPage />} />
          <Route path="/vacantes" element={<VacanciesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route
            path="/perfil"
            element={(
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            )}
          />
          <Route path="/construccion" element={<ConstruccionPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
