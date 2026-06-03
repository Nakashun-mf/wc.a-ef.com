import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

export function useAutoSave() {
  const saveCurrentPath = useAppStore(s => s._saveCurrentPath)

  // Save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentPath()
    }, 10_000)
    return () => clearInterval(interval)
  }, [saveCurrentPath])

  // Save on page unload
  useEffect(() => {
    const onUnload = () => saveCurrentPath()
    window.addEventListener('visibilitychange', onUnload)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      window.removeEventListener('visibilitychange', onUnload)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [saveCurrentPath])
}
