export type UserId = 'muhammadyusuf' | 'shavkatjon'

export interface User {
  id: string
  username: UserId
  email: string
  created_at: string
}

export interface TaskLog {
  id: string
  user_id: string
  date: string
  task_id: string
  completed: boolean
  sub_data: Record<string, string[]>
  input_data: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Reaction {
  id: string
  task_log_id: string
  user_id: string
  emoji: string
  count: number
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_completed: number
  last_completed_date: string | null
}

export interface TaskDefinition {
  id: string
  name: string
  sub: string
  type: 'sub' | 'input' | 'single'
  subs?: string[]
  fields?: { placeholder: string; key: string }[]
  isWeekly?: boolean
}

export interface DayStats {
  date: string
  completed: number
  total: number
  pct: number
}
