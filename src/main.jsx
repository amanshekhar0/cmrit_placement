import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './routes.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import { Analytics } from '@vercel/analytics/react'
import Clarity from '@microsoft/clarity'

const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID || "x9ngo867az";
if (projectId) {
  Clarity.init(projectId);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        {/* First tab stop on every page: lets keyboard users skip the nav. */}
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
    <Analytics />
  </StrictMode>,
)
