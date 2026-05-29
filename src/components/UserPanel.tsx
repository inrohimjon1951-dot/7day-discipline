'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TASK_DEFINITIONS, EMOJIS, isTaskComplete } from '@/lib/tasks'
import { todayStr, playDoneSound } from '@/lib/utils'
import type { User, TaskLog, Streak } from '@/types'
import MiniChart from './MiniChart'

interface Props {
  user: User
  isMe: boolean
  color: 'cyan' | 'red'
  logs: TaskLog[]
  streak?: Streak
  history: TaskLog[]
  onTaskSave?: (userId: string, taskId: string, subData: Record<string, string[]>, inputData: Record<string, string>) => Promise<void>
  onToast: (msg: string, color: string) => void
}

const C = {
  cyan: { main: '#00f5ff', dim: '#00c4cc', muted: 'rgba(0,245,255,0.12)', glow: '0 0 20px rgba(0,245,255,0.4)', border: 'rgba(0,245,255,0.25)', ambient: 'rgba(0,245,255,0.03)' },
  red:  { main: '#ff3366', dim: '#cc2952', muted: 'rgba(255,51,102,0.12)', glow: '0 0 20px rgba(255,51,102,0.4)', border: 'rgba(255,51,102,0.25)', ambient: 'rgba(255,51,102,0.03)' },
}

export default function UserPanel({ user, isMe, color, logs, streak, history, onTaskSave, onToast }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [inputData, setInputData] = useState<Record<string, Record<string, string>>>({})
  const [reactions, setReactions] = useState<Record<string, { emoji: string; count: number; id: string }[]>>({})
  const c = C[color]

  // Load reactions for today's logs
  useEffect(() => {
    const logIds = logs.map(l => l.id)
    if (!logIds.length) return
    const supabase = createClient()
    supabase.from('reactions').select('*').in('task_log_id', logIds).then(({ data }) => {
      if (!data) return
      const grouped: Record<string, { emoji: string; count: number; id: string }[]> = {}
      data.forEach(r => {
        if (!grouped[r.task_log_id]) grouped[r.task_log_id] = []
        grouped[r.task_log_id].push({ emoji: r.emoji, count: r.count, id: r.id })
      })
      setReactions(grouped)
    })
  }, [logs])

  // Init input data from logs
  useEffect(() => {
    const init: Record<string, Record<string, string>> = {}
    logs.forEach(l => { init[l.task_id] = l.input_data || {} })
    setInputData(init)
  }, [logs])

  function getLog(taskId: string): TaskLog | undefined {
    return logs.find(l => l.task_id === taskId && l.date === todayStr())
  }

  function getSubDone(taskId: string): string[] {
    const log = getLog(taskId)
    return log?.sub_data?.['subs'] || []
  }

  async function toggleSub(taskId: string, sub: string) {
    if (!isMe || !onTaskSave) return
    const current = getSubDone(taskId)
    const next = current.includes(sub) ? current.filter(s => s !== sub) : [...current, sub]
    await onTaskSave(user.id, taskId, { subs: next }, inputData[taskId] || {})
    if (!current.includes(sub)) {
      playDoneSound(color)
      onToast(`${sub} ✓ bajarildi!`, color)
    }
  }

  async function toggleTaskDone(taskId: string) {
    if (!isMe || !onTaskSave) return
    const task = TASK_DEFINITIONS.find(t => t.id === taskId)!
    const log = getLog(taskId)
    const wasDone = isTaskComplete(task, log as never)
    if (task.type === 'sub') {
      const next = wasDone ? [] : (task.subs || [])
      await onTaskSave(user.id, taskId, { subs: next }, inputData[taskId] || {})
    } else {
      const fields = task.fields || []
      const fakeData = wasDone ? {} : Object.fromEntries(fields.map(f => [f.key, '✓']))
      await onTaskSave(user.id, taskId, {}, wasDone ? {} : fakeData)
    }
    if (!wasDone) { playDoneSound(color); onToast(`${task.name} ✓`, color) }
  }

  async function saveInputField(taskId: string, key: string, val: string) {
    if (!isMe || !onTaskSave) return
    const next = { ...(inputData[taskId] || {}), [key]: val }
    setInputData(prev => ({ ...prev, [taskId]: next }))
    await onTaskSave(user.id, taskId, getLog(taskId)?.sub_data || {}, next)
  }

  async function handleReaction(taskId: string, emoji: string) {
    const log = getLog(taskId)
    if (!log) return
    await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_log_id: log.id, emoji }),
    })
    // Refresh reactions
    const supabase = createClient()
    const { data } = await supabase.from('reactions').select('*').eq('task_log_id', log.id)
    if (data) {
      setReactions(prev => ({
        ...prev,
        [log.id]: data.map(r => ({ emoji: r.emoji, count: r.count, id: r.id })),
      }))
    }
  }

  // Stats
  const doneTasks = TASK_DEFINITIONS.filter(t => isTaskComplete(t, getLog(t.id) as never)).length
  const totalTasks = TASK_DEFINITIONS.length
  const pct = Math.round((doneTasks / totalTasks) * 100)
  const momentum = Math.min(999, (streak?.current_streak || 0) * 50 + doneTasks * 7)

  // 7-day history for chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = d.toISOString().split('T')[0]
    const dayLogs = history.filter(l => l.date === ds && l.user_id === user.id)
    const done = dayLogs.filter(l => l.completed).length
    return done
  })
  last7[6] = doneTasks // today live

  const initials = user.username === 'muhammadyusuf' ? 'MY' : 'SH'
  const displayName = user.username === 'muhammadyusuf' ? 'Muhammadyusuf' : 'Shavkatjon'

  return (
    <div style={{
      padding: 20,
      background: `linear-gradient(180deg, ${c.ambient} 0%, transparent 60%)`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -80,
        [color === 'cyan' ? 'right' : 'left']: -80,
        width: 280, height: 280,
        background: `radial-gradient(circle, ${color === 'cyan' ? 'rgba(0,245,255,0.07)' : 'rgba(255,51,102,0.07)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* User header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          border: `2px solid ${c.main}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Orbitron', monospace",
          fontSize: 11, fontWeight: 700, color: c.main,
          boxShadow: c.glow,
          background: c.muted,
          flexShrink: 0,
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: c.main, letterSpacing: 0.5 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 10, color: '#555570', letterSpacing: 2, textTransform: 'uppercase' }}>
            {isMe ? 'SIZ' : 'RAQIB'} · {color === 'cyan' ? 'NEON CYAN' : 'NEON RED'}
          </div>
        </div>
        {!isMe && (
          <div style={{
            marginLeft: 'auto',
            fontSize: 9, color: c.main,
            background: c.muted,
            border: `1px solid ${c.border}`,
            borderRadius: 20,
            padding: '3px 8px',
            letterSpacing: 1,
          }}>LIVE</div>
        )}
      </div>

      {/* 7-day streak */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: '#555570', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          7-Kun Yo'li
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: 7 }, (_, i) => {
            const cur = streak?.current_streak || 0
            const isDone = i < cur
            const isToday = i === Math.min(cur, 6)
            return (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 6,
                border: `1px solid ${isDone || isToday ? c.main : c.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Orbitron', monospace",
                fontSize: 9, fontWeight: 700,
                color: isDone || isToday ? c.main : `${c.main}40`,
                background: isDone ? c.muted : 'transparent',
                boxShadow: isToday ? c.glow : 'none',
                animation: isToday ? (color === 'cyan' ? 'pulseCyan 1.5s ease-in-out infinite' : 'pulseRed 1.5s ease-in-out infinite') : 'none',
              }}>{i + 1}</div>
            )
          })}
        </div>
      </div>

      {/* Momentum */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          height: 3, borderRadius: 2,
          background: '#1e1e30', overflow: 'hidden', marginBottom: 4,
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${Math.min(100, momentum / 10)}%`,
            background: `linear-gradient(90deg, ${c.dim}, ${c.main})`,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: '#555570', letterSpacing: 1 }}>Momentum</span>
          <span style={{ color: c.main, fontFamily: "'Orbitron', monospace", fontWeight: 700 }}>{momentum}</span>
        </div>
      </div>

      {/* Tracker */}
      <div style={{
        background: '#141420',
        borderRadius: 12,
        border: '1px solid #1e1e30',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        {/* Tracker header */}
        <div style={{
          padding: '9px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #1e1e30',
        }}>
          <div style={{ fontSize: 10, color: '#555570', letterSpacing: 2, textTransform: 'uppercase' }}>
            Bugungi Tracker
          </div>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: 11, fontWeight: 700, color: c.main }}>
            {doneTasks}/{totalTasks}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: '#1e1e30' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${c.dim}, ${c.main})`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Tasks */}
        {TASK_DEFINITIONS.map((task, idx) => {
          const log = getLog(task.id)
          const done = isTaskComplete(task, log as never)
          const subDone = getSubDone(task.id)
          const isExpanded = expanded === `${user.id}-${task.id}`
          const logReactions = log ? (reactions[log.id] || []) : []

          return (
            <div key={task.id} style={{ borderBottom: idx < TASK_DEFINITIONS.length - 1 ? '1px solid #1e1e30' : 'none' }}>
              {/* Task row */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px',
                  cursor: 'pointer',
                  background: done ? `${c.muted}` : 'transparent',
                }}
                onClick={() => setExpanded(isExpanded ? null : `${user.id}-${task.id}`)}
              >
                {/* Number */}
                <div style={{
                  width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                  border: `1px solid ${done ? c.main : c.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 8, fontWeight: 700,
                  color: done ? c.main : `${c.main}40`,
                  background: done ? c.muted : 'transparent',
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Check button */}
                <div
                  style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${done ? c.main : c.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? c.main : 'transparent',
                    boxShadow: done ? c.glow : 'none',
                    cursor: isMe ? 'pointer' : 'default',
                    transition: 'all 0.25s',
                  }}
                  onClick={e => { e.stopPropagation(); if (isMe) toggleTaskDone(task.id) }}
                >
                  {done && (
                    <svg width="10" height="8" viewBox="0 0 10 8">
                      <polyline points="1,4 4,7 9,1" fill="none" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: done ? '#8888aa' : '#e8e8f0', textDecoration: done ? 'line-through' : 'none' }}>
                    {task.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#555570', marginTop: 1 }}>{task.sub}</div>
                </div>

                {/* Weekly badge */}
                {task.isWeekly && (
                  <div style={{
                    fontSize: 8, color: c.main,
                    background: c.muted,
                    border: `1px solid ${c.border}`,
                    borderRadius: 4, padding: '1px 5px',
                    letterSpacing: 1, flexShrink: 0,
                  }}>HAFTALIK</div>
                )}

                {/* Expand arrow */}
                <div style={{
                  fontSize: 12, color: '#555570',
                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}>▾</div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{
                  padding: '0 14px 12px 46px',
                  animation: 'slideDown 0.2s ease',
                }}>
                  {/* Sub-tasks (namoz) */}
                  {task.type === 'sub' && task.subs && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                      {task.subs.map(s => {
                        const isDone = subDone.includes(s)
                        return (
                          <div
                            key={s}
                            onClick={() => toggleSub(task.id, s)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 11, fontWeight: 600,
                              border: `1px solid ${isDone ? c.main : c.border}`,
                              color: isDone ? c.main : `${c.main}60`,
                              background: isDone ? c.muted : 'transparent',
                              cursor: isMe ? 'pointer' : 'default',
                              transition: 'all 0.2s',
                            }}
                          >{s}</div>
                        )
                      })}
                    </div>
                  )}

                  {/* Input fields */}
                  {task.type === 'input' && task.fields && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                      {task.fields.map(f => (
                        <input
                          key={f.key}
                          className={color === 'red' ? 'red-focus' : ''}
                          placeholder={f.placeholder}
                          value={inputData[task.id]?.[f.key] || ''}
                          disabled={!isMe}
                          onChange={e => {
                            const next = { ...(inputData[task.id] || {}), [f.key]: e.target.value }
                            setInputData(prev => ({ ...prev, [task.id]: next }))
                          }}
                          onBlur={e => saveInputField(task.id, f.key, e.target.value)}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${c.border}`,
                            borderRadius: 6, padding: '6px 10px',
                            fontSize: 12, color: '#e8e8f0',
                            fontFamily: "'Space Grotesk', sans-serif",
                            outline: 'none', width: '100%',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {EMOJIS.map(emoji => {
                      const r = logReactions.find(x => x.emoji === emoji)
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(task.id, emoji)}
                          style={{
                            background: r ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${r ? 'rgba(255,255,255,0.2)' : '#1e1e30'}`,
                            borderRadius: 14, padding: '3px 7px',
                            fontSize: 13, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 3,
                            transition: 'all 0.15s',
                          }}
                        >
                          {emoji}
                          {r && r.count > 0 && (
                            <span style={{ fontSize: 10, color: '#8888aa', fontFamily: "'Orbitron', monospace" }}>
                              {r.count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div style={{
        background: '#141420',
        border: '1px solid #1e1e30',
        borderRadius: 12, padding: 14, marginBottom: 16,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Streak', val: streak?.current_streak || 0 },
            { label: 'Bugun', val: `${pct}%` },
            { label: 'Jami', val: streak?.total_completed || 0 },
          ].map(({ label, val }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1e1e30',
              borderRadius: 8, padding: '8px 10px', textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 18, fontWeight: 700, color: c.main,
                textShadow: `0 0 8px ${color === 'cyan' ? 'rgba(0,245,255,0.4)' : 'rgba(255,51,102,0.4)'}`,
                lineHeight: 1,
              }}>{val}</div>
              <div style={{ fontSize: 8, color: '#555570', letterSpacing: 1, textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 9, color: '#555570', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
          Haftalik Faollik
        </div>
        <MiniChart data={last7} color={color} />
      </div>
    </div>
  )
}
