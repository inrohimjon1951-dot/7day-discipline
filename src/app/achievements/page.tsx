import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AchievementsClient from '@/components/AchievementsClient'
import type { User, Streak, TaskLog } from '@/types'

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: allUsers } = await supabase.from('users').select('*')
  const { data: streaks } = await supabase.from('streaks').select('*')
  const { data: logs } = await supabase
    .from('task_logs')
    .select('id, user_id, date, task_id, completed, sub_data, input_data, created_at, updated_at')
    .order('date', { ascending: false })

  return (
    <AchievementsClient
      allUsers={(allUsers || []) as User[]}
      streaks={(streaks || []) as Streak[]}
      logs={(logs || []) as TaskLog[]}
      currentUserId={user.id}
    />
  )
}
