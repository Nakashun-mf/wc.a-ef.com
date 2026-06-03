import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

export function useKeyboard() {
  const undo = useAppStore(s => s.undo)
  const redo = useAppStore(s => s.redo)
  const selectedPointId = useAppStore(s => s.selectedPointId)
  const deletePoint = useAppStore(s => s.deletePoint)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPointId) {
        e.preventDefault()
        deletePoint(selectedPointId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo, selectedPointId, deletePoint])
}
