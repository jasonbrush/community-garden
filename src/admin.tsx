import React from 'react'
import ReactDOM from 'react-dom/client'
import { applyMode } from '@cloudscape-design/global-styles'
import '@cloudscape-design/global-styles/index.css'
import './pages/AdminPage.css'
import { AdminPage } from './pages/AdminPage'

// Set visual mode to light before rendering
applyMode('light' as any)

// Also set data attribute on html element
document.documentElement.setAttribute('data-awsui-mode', 'light')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AdminPage />
  </React.StrictMode>,
)
