import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { fetchHealth } from './services/api'
import { getOrCreateSessionId } from './utils/session'
import { useProfileStore } from './store/useProfileStore'

const root = document.getElementById('root')
if (!root) {
  throw new Error('No se encontró el elemento #root')
}

getOrCreateSessionId()
useProfileStore.getState().setSessionId(getOrCreateSessionId())

fetchHealth().then(({ mock }) => {
  useProfileStore.getState().setApiUsesMock(mock)
})

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
