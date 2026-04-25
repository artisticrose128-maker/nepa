import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeMobileOptimizations } from './utils/mobilePerformance'

// Initialize mobile optimizations
initializeMobileOptimizations()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
