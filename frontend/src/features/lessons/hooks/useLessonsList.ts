import { useCallback, useEffect, useState } from 'react'

import { getLessons } from '../api/lessonsApi'
import type { GetLessonsParams } from '../api/lessonsApi'
import type { Lesson } from '../types/lesson.types'

type UseLessonsListResult = {
  lessons: Lesson[]
  total: number
  loading: boolean
  error: string
  reload: () => Promise<void>
}

export function useLessonsList(params: GetLessonsParams): UseLessonsListResult {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getLessons(params)
      setLessons(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setLessons([])
      setTotal(0)
      setError(requestError instanceof Error ? requestError.message : 'Unable to load lessons.')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload()
    }, 200)

    return () => window.clearTimeout(timer)
  }, [reload])

  return { lessons, total, loading, error, reload }
}
