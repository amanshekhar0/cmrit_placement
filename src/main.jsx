import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'
import Clarity from '@microsoft/clarity'

const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID || "yourProjectId";
Clarity.init(projectId);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)
