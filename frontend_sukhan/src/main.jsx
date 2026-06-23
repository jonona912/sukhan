import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// strictMode is for highlighting potential problems in an application. 
// It activates additional checks and warnings for its descendants. 
// Strict mode checks are run in development mode only; they do not impact the production build.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
