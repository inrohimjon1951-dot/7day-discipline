import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { task_log_id, emoji } = await req.json()

  // Check existing reaction
  const { data: existing } = await supabase
    .from('reactions')
    .select('*')
    .eq('task_log_id', task_log_id)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .single()

  if (existing) {
    const newCount = existing.count + 1
    if (newCount > 9) {
      await supabase.from('reactions').delete().eq('id', existing.id)
      return NextResponse.json({ deleted: true })
    }
    const { data } = await supabase
      .from('reactions')
      .update({ count: newCount })
      .eq('id', existing.id)
      .select()
      .single()
    return NextResponse.json({ data })
  }

  const { data } = await supabase
    .from('reactions')
    .insert({ task_log_id, user_id: user.id, emoji, count: 1 })
    .select()
    .single()

  return NextResponse.json({ data })
}
