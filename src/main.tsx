import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { PublicPage } from './pages/PublicPage'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PublicPage />
  </React.StrictMode>,
)