import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/error-boundary.tsx'
import { LicenseGate } from './components/license-gate.tsx'

document.documentElement.lang = 'ar'
document.documentElement.dir = 'rtl'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <LicenseGate>
      <HashRouter>
        <App />
      </HashRouter>
    </LicenseGate>
  </ErrorBoundary>,
)
