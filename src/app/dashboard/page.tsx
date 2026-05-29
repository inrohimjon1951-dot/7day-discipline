import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Current user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  // Both users profiles
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')

  // Today's task logs for all users
  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('task_logs')
    .select('*')
    .eq('date', today)

  // Streaks
  const { data: streaks } = await supabase
    .from('streaks')
    .select('*')

  // Last 7 days history
  const { data: history } = await supabase
    .from('task_logs')
    .select('user_id, date, task_id, completed, sub_data, input_data')
    .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
    .order('date', { ascending: false })

  return (
    <DashboardClient
      currentUser={profile}
      allUsers={allUsers || []}
      initialLogs={todayLogs || []}
      initialStreaks={streaks || []}
      history={history || []}
    />
  )
}
