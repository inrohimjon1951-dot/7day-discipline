'use client'

import type { User } from '@/types'

interface Props {
  time: string
  date: string
  countdown: string
  currentUser: User
}

export default function Header({ time, date, countdown, currentUser }: Props) {
  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <header style={{
      background: '#0f0f1a',
      borderBottom: '1px solid #1e1e30',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Title */}
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 3,
        color: '#e8e8f0',
        textTransform: 'uppercase',
      }}>
        7 DAY <span style={{ color: '#00f5ff', textShadow: '0 0 12px rgba(0,245,255,0.5)' }}>DISCIPLINE</span>
      </div>

      {/* Time block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <TimeItem label="Sana" value={date} color="#8888aa" />
        <TimeItem label="Vaqt" value={time} color="#00f5ff" />
        <TimeItem label="Muddat" value={countdown} color="#ff3366" />
      </div>

      {/* User + signout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontSize: 11,
          color: currentUser.username === 'muhammadyusuf' ? '#00f5ff' : '#ff3366',
          letterSpacing: 1,
          fontWeight: 600,
        }}>
          {currentUser.username === 'muhammadyusuf' ? 'Muhammadyusuf' : 'Shavkatjon'}
        </span>
        <button
          onClick={signOut}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #1e1e30',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 10,
            color: '#555570',
            cursor: 'pointer',
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Chiqish
        </button>
      </div>
    </header>
  )
}

function TimeItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontSize: 8, color: '#555570', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 12, fontWeight: 700, color,
      }}>
        {value || '--'}
      </div>
    </div>
  )
}
