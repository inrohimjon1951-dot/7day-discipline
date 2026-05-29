/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
'use client'

import { TASK_DEFINITIONS } from '@/lib/tasks'
import type { User, Streak, TaskLog } from '@/types'
import MiniChart from './MiniChart'

interface Props {
  allUsers: User[]
  streaks: Streak[]
  logs: TaskLog[]
  currentUserId: string
}

export default function AchievementsClient({ allUsers, streaks, logs, currentUserId }: Props) {
  function getStreak(userId: string) {
    return streaks.find(s => s.user_id === userId)
  }

  function getCompletedDays(userId: string): number {
    const byDate: Record<string, number> = {}
    logs
      .filter(l => l.user_id === userId && l.completed)
      .forEach(l => { byDate[l.date] = (byDate[l.date] || 0) + 1 })
    return Object.values(byDate).filter(c => c >= TASK_DEFINITIONS.length).length
  }

  function getLast7(userId: string): number[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      const ds = d.toISOString().split('T')[0]
      return logs.filter(l => l.user_id === userId && l.date === ds && l.completed).length
    })
  }

  const sorted = [...allUsers].sort((a, b) => {
    const sa = getStreak(a.id)?.current_streak || 0
    const sb = getStreak(b.id)?.current_streak || 0
    return sb - sa
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Space Grotesk', sans-serif", padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{
        background: '#0f0f1a',
        borderBottom: '1px solid #1e1e30',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 13, fontWeight: 700, letterSpacing: 3, color: '#e8e8f0',
        }}>
          7 DAY <span style={{ color: '#00f5ff' }}>DISCIPLINE</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <a href="/dashboard" style={{
            padding: '10px 16px', fontSize: 11, fontWeight: 600,
            letterSpacing: 2, textTransform: 'uppercase',
            color: '#555570', textDecoration: 'none',
          }}>Dashboard</a>
          <a href="/achievements" style={{
            padding: '10px 16px', fontSize: 11, fontWeight: 600,
            letterSpacing: 2, textTransform: 'uppercase',
            color: '#00f5ff', borderBottom: '2px solid #00f5ff',
            textDecoration: 'none',
          }}>Yutuqlar</a>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 22, fontWeight: 900, letterSpacing: 4,
          color: '#e8e8f0', textAlign: 'center', marginBottom: 8,
        }}>
          YUTUQLAR <span style={{ color: '#00f5ff' }}>TAXTASI</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#555570', fontSize: 12, letterSpacing: 2, marginBottom: 40 }}>
          MOMENTUM · STREAK · REYTING
        </p>

        {/* Player cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          {sorted.map((user, rank) => {
            const isMe = user.id === currentUserId
            const color = user.username === 'muhammadyusuf' ? 'cyan' : 'red'
            const c = color === 'cyan'
              ? { main: '#00f5ff', muted: 'rgba(0,245,255,0.1)', glow: '0 0 24px rgba(0,245,255,0.3)', border: 'rgba(0,245,255,0.2)' }
              : { main: '#ff3366', muted: 'rgba(255,51,102,0.1)', glow: '0 0 24px rgba(255,51,102,0.3)', border: 'rgba(255,51,102,0.2)' }
            const streak = getStreak(user.id)
            const completedDays = getCompletedDays(user.id)
            const momentum = Math.min(999, (streak?.current_streak || 0) * 50 + completedDays * 7)
            const last7 = getLast7(user.id)
            const displayName = user.username === 'muhammadyusuf' ? 'Muhammadyusuf' : 'Shavkatjon'

            return (
              <div key={user.id} style={{
                background: '#141420',
                border: `1px solid ${rank === 0 ? c.main : '#1e1e30'}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: rank === 0 ? c.glow : 'none',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {rank === 0 && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 18,
                  }}>🏆</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    border: `2px solid ${c.main}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 13, fontWeight: 700, color: c.main,
                    boxShadow: c.glow, background: c.muted,
                  }}>
                    {user.username === 'muhammadyusuf' ? 'MY' : 'SH'}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c.main }}>{displayName}</div>
                    <div style={{ fontSize: 10, color: '#555570', letterSpacing: 1 }}>
                      #{rank + 1} · {isMe ? 'SIZ' : 'RAQIB'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: 'Streak', val: streak?.current_streak || 0 },
                    { label: "To'liq kun", val: completedDays },
                    { label: 'Momentum', val: momentum },
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid #1e1e30',
                      borderRadius: 8, padding: '8px',
                      textAlign: 'center',
                    }}>
                      <div style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: 16, fontWeight: 700, color: c.main, lineHeight: 1,
                      }}>{val}</div>
                      <div style={{ fontSize: 8, color: '#555570', letterSpacing: 1, marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 9, color: '#555570', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                  Oxirgi 7 kun
                </div>
                <MiniChart data={last7} color={color} height={48} />
              </div>
            )
          })}
        </div>

        {/* Winner banner */}
        {sorted[0] && (
          <div style={{
            background: '#141420',
            border: '1px solid #ffd700',
            borderRadius: 12,
            padding: '20px 24px',
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(255,215,0,0.15)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🏆</div>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 11, letterSpacing: 3, color: '#ffd700',
              textTransform: 'uppercase', marginBottom: 4,
            }}>Hozirgi Yetakchi</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e8e8f0' }}>
              {sorted[0].username === 'muhammadyusuf' ? 'Muhammadyusuf' : 'Shavkatjon'}
            </div>
            <div style={{ fontSize: 12, color: '#8888aa', marginTop: 4 }}>
              {getStreak(sorted[0].id)?.current_streak || 0} kun streak · {getCompletedDays(sorted[0].id)} to'liq kun
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
