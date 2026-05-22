import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../../lib/api'
import { getPublicLessons } from '../api/publicLessonsApi'
import type { PublicLessonListItem } from '../types/publicLesson.types'

type PublicLessonsListState = {
  lessons: PublicLessonListItem[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function usePublicLessonsList(): PublicLessonsListState {
  const [lessons, setLessons] = useState<PublicLessonListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLessons = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPublicLessons()
      setLessons(response.data)
    } catch (loadError) {
      const message =
        loadError instanceof ApiError
          ? loadError.message
          : 'We could not load lessons right now. Please try again.'
      setError(message)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLessons()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadLessons])

  return {
    lessons,
    loading,
    error,
    reload: loadLessons,
  }
}
