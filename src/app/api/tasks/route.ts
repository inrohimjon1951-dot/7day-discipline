import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TASK_DEFINITIONS, isTaskComplete } from '@/lib/tasks'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { task_id, sub_data, input_data, date } = body
  const targetDate = date || new Date().toISOString().split('T')[0]

  const task = TASK_DEFINITIONS.find(t => t.id === task_id)
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  // Upsert task log
  const { data, error } = await supabase
    .from('task_logs')
    .upsert(
      {
        user_id: user.id,
        date: targetDate,
        task_id,
        sub_data: sub_data || {},
        input_data: input_data || {},
        completed: isTaskComplete(task, { sub_data, input_data } as never),
      },
      { onConflict: 'user_id,date,task_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update streak
  await updateStreak(supabase, user.id, targetDate)

  return NextResponse.json({ data })
}

async function updateStreak(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  date: string
) {
  // Check if all 7 tasks done today
  const { data: logs } = await supabase
    .from('task_logs')
    .select('completed')
    .eq('user_id', userId)
    .eq('date', date)

  const doneTasks = logs?.filter(l => l.completed).length || 0
  const allDone = doneTasks >= TASK_DEFINITIONS.length

  if (!allDone) return

  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const wasYesterday = streak?.last_completed_date === yesterdayStr
  const newStreak = wasYesterday ? (streak?.current_streak || 0) + 1 : 1

  await supabase
    .from('streaks')
    .upsert({
      user_id: userId,
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak?.longest_streak || 0),
      total_completed: (streak?.total_completed || 0) + (wasYesterday ? 0 : 1),
      last_completed_date: date,
    }, { onConflict: 'user_id' })
}
