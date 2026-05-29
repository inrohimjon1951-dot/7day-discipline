import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AchievementsClient from '@/components/AchievementsClient'

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: allUsers } = await supabase.from('users').select('*')
  const { data: streaks } = await supabase.from('streaks').select('*')
  const { data: logs } = await supabase
    .from('task_logs')
    .select('user_id, date, task_id, completed, sub_data, input_data')
    .order('date', { ascending: false })

  return (
    <AchievementsClient
      allUsers={allUsers || []}
      streaks={streaks || []}
      logs={logs || []}
      currentUserId={user.id}
    />
  )
}
