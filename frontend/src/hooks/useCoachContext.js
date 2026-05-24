import { useContext } from 'react'
import { CoachContext } from '../context/coachContextState'

export function useCoachContext() {
  const ctx = useContext(CoachContext)
  if (!ctx) {
    throw new Error('useCoachContext must be used within CoachProvider')
  }
  return ctx
}

export function useCoachContextOptional() {
  return useContext(CoachContext)
}
