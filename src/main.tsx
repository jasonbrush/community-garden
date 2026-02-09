import React from 'react'
import ReactDOM from 'react-dom/client'
import '@cloudscape-design/global-styles/index.css'
import './index.css'
import './App.css'
import './pages/AdminPage.css'

// Simple router that loads the appropriate component
const path = window.location.pathname

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

if (path === '/admin') {
  // Load admin page
  import('./pages/AdminPage').then(({ AdminPage }) => {
    import('@cloudscape-design/global-styles').then(({ applyMode }) => {
      applyMode('light' as any)
      document.documentElement.setAttribute('data-awsui-mode', 'light')
      
      root.render(
        <React.StrictMode>
          <AdminPage />
        </React.StrictMode>
      )
    })
  })
} else {
  // Load public landing page
  import('./pages/LandingPage').then(({ LandingPage }) => {
    import('@cloudscape-design/components/theming').then(({ applyTheme }) => {
      import('./theme').then(({ communityGardenTheme }) => {
        applyTheme({ theme: communityGardenTheme })
        
        root.render(
          <React.StrictMode>
            <LandingPage />
          </React.StrictMode>
        )
      })
    })
  })
}
