// Simple router that loads the appropriate entry point
const path = window.location.pathname

if (path === '/admin') {
  // Load admin entry point
  import('./admin')
} else {
  // Load public entry point
  import('./public')
}
