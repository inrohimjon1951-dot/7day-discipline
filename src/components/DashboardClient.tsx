'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TASK_DEFINITIONS, EMOJIS, isTaskComplete } from '@/lib/tasks'
import { todayStr, playDoneSound } from '@/lib/utils'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { useTimer } from '@/hooks/useTimer'
import type { User, TaskLog, Streak } from '@/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import Header from './Header'
import UserPanel from './UserPanel'

interface Props {
  currentUser: User
  allUsers: User[]
  initialLogs: TaskLog[]
  initialStreaks: Streak[]
  history: TaskLog[]
}

export default function DashboardClient({
  currentUser, allUsers, initialLogs, initialStreaks, history,
}: Props) {
  const [logs, setLogs] = useState<TaskLog[]>(initialLogs)
  const [streaks, setStreaks] = useState<Streak[]>(initialStreaks)
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null)
  const { time, date, countdown, theme } = useTimer()

  const isMyUser = (uid: string) => uid === currentUser.id
  const myColor = currentUser.username === 'muhammadyusuf' ? 'cyan' : 'red'

  // Show toast
  function showToast(msg: string, color: string) {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2500)
  }

  // Realtime: task_logs
  const handleTaskChange = useCallback((payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
    const record = (payload.new || payload.old) as TaskLog | undefined
    if (!record) return
    if (payload.eventType === 'DELETE') {
      setLogs(prev => prev.filter(l => l.id !== (payload.old as TaskLog)?.id))
    } else {
      setLogs(prev => {
        const idx = prev.findIndex(l => l.id === record.id)
        if (idx >= 0) {
          const next = [...prev]; next[idx] = record as TaskLog; return next
        }
        return [...prev, record as TaskLog]
      })
    }
  }, [])

  // Realtime: streaks
  const handleReactionChange = useCallback((payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
    // reactions handled inside UserPanel via refetch
    void payload
  }, [])

  useRealtimeSync(handleTaskChange, handleReactionChange)

  // Streak realtime
  useEffect(() => {
    const supabase = createClient()
    const ch = supabase
      .channel('streaks-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks' }, (payload) => {
        const record = (payload.new || payload.old) as Streak | undefined
        if (!record) return
        setStreaks(prev => {
          const idx = prev.findIndex(s => s.user_id === record.user_id)
          if (idx >= 0) { const next = [...prev]; next[idx] = record; return next }
          return [...prev, record]
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // Save task
  async function saveTask(userId: string, taskId: string, subData: Record<string, string[]>, inputData: Record<string, string>) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, sub_data: subData, input_data: inputData }),
    })
    if (!res.ok) console.error('Task save error')
  }

  const myUser = allUsers.find(u => u.id === currentUser.id)
  const otherUser = allUsers.find(u => u.id !== currentUser.id)

  // Sort: current user always left
  const panels = [
    { user: myUser || currentUser, isMe: true },
    ...(otherUser ? [{ user: otherUser, isMe: false }] : []),
  ]
  // If current user is shavkatjon, put them right, muhammadyusuf left
  const sortedPanels = currentUser.username === 'shavkatjon'
    ? [panels[1] || panels[0], panels[0]]
    : panels

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <Header time={time} date={date} countdown={countdown} currentUser={currentUser} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f0f1a',
          border: `1px solid ${toast.color === 'cyan' ? 'rgba(0,245,255,0.3)' : 'rgba(255,51,102,0.3)'}`,
          borderRadius: 10, padding: '10px 20px',
          fontSize: 13, color: '#e8e8f0',
          display: 'flex', alignItems: 'center', gap: 8,
          zIndex: 999, whiteSpace: 'nowrap',
          animation: 'glowIn 0.3s ease',
          boxShadow: toast.color === 'cyan'
            ? '0 0 20px rgba(0,245,255,0.2)'
            : '0 0 20px rgba(255,51,102,0.2)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: toast.color === 'cyan' ? '#00f5ff' : '#ff3366',
          }} />
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <div style={{
        background: '#0f0f1a',
        borderBottom: '1px solid #1e1e30',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <a href="/dashboard" style={{
          padding: '10px 16px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#00f5ff',
          borderBottom: '2px solid #00f5ff',
          textDecoration: 'none',
        }}>Dashboard</a>
        <a href="/achievements" style={{
          padding: '10px 16px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#555570',
          textDecoration: 'none',
        }}>Yutuqlar</a>
      </div>

      {/* Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 110px)',
        position: 'relative',
      }}>
        {/* VS divider */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%',
          width: 1, background: '#1e1e30', zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          background: '#0f0f1a',
          border: '1px solid #1e1e30',
          borderRadius: '50%', width: 38, height: 38,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Orbitron', monospace",
          fontSize: 9, fontWeight: 700, color: '#555570', letterSpacing: 1,
          zIndex: 2,
        }}>VS</div>

        {sortedPanels.map(({ user, isMe }) => {
          if (!user) return null
          const userLogs = logs.filter(l => l.user_id === user.id)
          const userStreak = streaks.find(s => s.user_id === user.id)
          const userHistory = history.filter(l => l.user_id === user.id)
          const col = user.username === 'muhammadyusuf' ? 'cyan' : 'red'

          return (
            <UserPanel
              key={user.id}
              user={user}
              isMe={isMe}
              color={col}
              logs={userLogs}
              streak={userStreak}
              history={userHistory}
              onTaskSave={isMe ? saveTask : undefined}
              onToast={showToast}
            />
          )
        })}
      </div>
    </div>
  )
}
