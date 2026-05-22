import type { DragEvent } from 'react'
import { useCallback, useState } from 'react'

import { reorderLessonItem } from '../api/lessonItemsApi'
import type { LessonItem, ReorderDirection } from '../types/lessonItem.types'
import { reorderLessonItemsLocally } from '../utils/lessonItemDisplay'

async function moveLessonItemToIndex(itemId: string, fromIndex: number, toIndex: number) {
  const direction: ReorderDirection = fromIndex < toIndex ? 'down' : 'up'
  const steps = Math.abs(toIndex - fromIndex)

  let response
  for (let step = 0; step < steps; step += 1) {
    response = await reorderLessonItem(itemId, direction)
  }

  return response!.data
}

type Options = {
  items: LessonItem[]
  onItemsChange: (items: LessonItem[]) => void
  onReorderSuccess: () => void
  onReorderError: () => void
}

export function useLessonItemsDragReorder({ items, onItemsChange, onReorderSuccess, onReorderError }: Options) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)

  const handleDragStart = useCallback((itemId: string) => {
    setDraggingId(itemId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setDragOverId(null)
  }, [])

  const handleDragOver = useCallback((event: DragEvent, itemId: string) => {
    event.preventDefault()
    if (draggingId && draggingId !== itemId) {
      setDragOverId(itemId)
    }
  }, [draggingId])

  const handleDrop = useCallback(
    async (targetItemId: string) => {
      if (!draggingId || draggingId === targetItemId || reordering) {
        handleDragEnd()
        return
      }

      const fromIndex = items.findIndex((item) => item.id === draggingId)
      const toIndex = items.findIndex((item) => item.id === targetItemId)

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        handleDragEnd()
        return
      }

      const previousItems = items
      const optimisticItems = reorderLessonItemsLocally(items, fromIndex, toIndex)
      onItemsChange(optimisticItems)
      setReordering(true)
      handleDragEnd()

      try {
        const syncedItems = await moveLessonItemToIndex(draggingId, fromIndex, toIndex)
        onItemsChange(syncedItems)
        onReorderSuccess()
      } catch {
        onItemsChange(previousItems)
        onReorderError()
      } finally {
        setReordering(false)
      }
    },
    [draggingId, handleDragEnd, items, onItemsChange, onReorderError, onReorderSuccess, reordering],
  )

  return {
    draggingId,
    dragOverId,
    reordering,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  }
}
