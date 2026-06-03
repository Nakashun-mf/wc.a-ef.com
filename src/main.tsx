import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import { App } from './App'

// Debug console (Eruda) — only when ?debug=true
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search)
  if (params.get('debug') === 'true') {
    import('eruda').then(({ default: eruda }) => eruda.init())
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
