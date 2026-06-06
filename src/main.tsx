import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import { App } from './App'
import { ManualPage } from './components/manual/ManualPage'

// Debug console (Eruda) — only when ?debug=true
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search)
  if (params.get('debug') === 'true') {
    import('eruda').then(({ default: eruda }) => eruda.init())
  }
}

function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const handler = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])
  if (hash === '#/manual') return <ManualPage />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
