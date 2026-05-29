import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'
import type { User, TaskLog, Streak } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  const { data: allUsers } = await supabase.from('users').select('*')

  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('task_logs')
    .select('id, user_id, date, task_id, completed, sub_data, input_data, created_at, updated_at')
    .eq('date', today)

  const { data: streaks } = await supabase.from('streaks').select('*')

  const { data: history } = await supabase
    .from('task_logs')
    .select('id, user_id, date, task_id, completed, sub_data, input_data, created_at, updated_at')
    .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
    .order('date', { ascending: false })

  return (
    <DashboardClient
      currentUser={profile as User}
      allUsers={(allUsers || []) as User[]}
      initialLogs={(todayLogs || []) as TaskLog[]}
      initialStreaks={(streaks || []) as Streak[]}
      history={(history || []) as TaskLog[]}
    />
  )
}
