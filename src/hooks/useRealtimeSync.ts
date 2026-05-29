'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type ChangeCallback = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void

export function useRealtimeSync(onTaskChange: ChangeCallback, onReactionChange: ChangeCallback) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('discipline-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_logs' },
        onTaskChange
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        onReactionChange
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onTaskChange, onReactionChange])
}

export function useStreakSync(onStreakChange: ChangeCallback) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('streak-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'streaks' },
        onStreakChange
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onStreakChange])
}
