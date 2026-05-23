import { BrowserRouter, Route, Routes } from 'react-router-dom'
import OnboardingPage from './pages/OnboardingPage'
import ResultsPage from './pages/ResultsPage'
import WelcomePage from './pages/WelcomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/comenzar" element={<OnboardingPage />} />
        <Route path="/resultados" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
