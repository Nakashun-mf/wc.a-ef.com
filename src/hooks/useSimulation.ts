import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import { getTotalPathLength } from '@/domain/utils'

export function useSimulation() {
  const simulation = useAppStore(s => s.simulation)
  const setSimulation = useAppStore(s => s.setSimulation)
  const stopSimulation = useAppStore(s => s.stopSimulation)
  const currentPath = useAppStore(s => s.currentPath)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (simulation.running) {
      lastTimeRef.current = 0

      const tick = (now: number) => {
        if (!simulation.running) return
        if (lastTimeRef.current === 0) {
          lastTimeRef.current = now
          rafRef.current = requestAnimationFrame(tick)
          return
        }

        const dt = (now - lastTimeRef.current) / 1000
        lastTimeRef.current = now

        const totalLength = getTotalPathLength(currentPath)
        if (totalLength === 0) {
          stopSimulation()
          return
        }

        const distPerSec = simulation.speedMmPerSec
        const distDelta = distPerSec * dt
        const newProgress = simulation.progress + distDelta / totalLength

        if (newProgress >= 1) {
          setSimulation({ progress: 1, trailProgress: 1, running: false })
          return
        }

        setSimulation({ progress: newProgress, trailProgress: newProgress })
        rafRef.current = requestAnimationFrame(tick)
      }

      rafRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = 0
    }

    return () => cancelAnimationFrame(rafRef.current)
  }, [simulation.running, simulation.speedMmPerSec, simulation.progress, currentPath, setSimulation, stopSimulation])

  const skip = useCallback(() => {
    setSimulation({ progress: 1, trailProgress: 1, running: false })
  }, [setSimulation])

  return { skip }
}
