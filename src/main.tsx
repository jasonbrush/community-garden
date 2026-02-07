import React from 'react'
import ReactDOM from 'react-dom/client'

// Cloudscape global styles
import '@cloudscape-design/global-styles/index.css'

// Your app styles (optional, from the Vite template)
import './index.css'

// Public page component
import { PublicPage } from './pages/PublicPage'

console.log('*** MAIN.TSX RENDERING PUBLICPAGE ***')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PublicPage />
  </React.StrictMode>,
)