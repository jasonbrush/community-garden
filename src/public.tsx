import React from 'react'
import ReactDOM from 'react-dom/client'
import { applyTheme } from '@cloudscape-design/components/theming'
import '@cloudscape-design/global-styles/index.css'
import './index.css'
import './App.css'
import { LandingPage } from './pages/LandingPage'
import { communityGardenTheme } from './theme'

// Apply custom garden theme
applyTheme({ theme: communityGardenTheme })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>,
)
