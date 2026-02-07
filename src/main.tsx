import React from 'react'
import ReactDOM from 'react-dom/client'
import '@cloudscape-design/global-styles/index.css'
import './index.css'
import { PublicPage } from './pages/PublicPage'

console.log('*** MAIN.TSX RENDERING PUBLICPAGE ***')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PublicPage />
  </React.StrictMode>,
)