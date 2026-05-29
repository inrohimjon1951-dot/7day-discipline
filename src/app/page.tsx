'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserId } from '@/types'

const USERS: { id: UserId; label: string; color: string; glow: string; bg: string }[] = [
  {
    id: 'muhammadyusuf',
    label: 'Muhammadyusuf',
    color: '#00f5ff',
    glow: '0 0 30px rgba(0,245,255,0.5)',
    bg: 'rgba(0,245,255,0.07)',
  },
  {
    id: 'shavkatjon',
    label: 'Shavkatjon',
    color: '#ff3366',
    glow: '0 0 30px rgba(255,51,102,0.5)',
    bg: 'rgba(255,51,102,0.07)',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<UserId | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const user = USERS.find(u => u.id === selected)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      // Agar user yo'q bo'lsa, ro'yxatdan o'tkazamiz
      if (authError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: selected } },
        })
        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }
        // users table ga qo'shamiz
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          await supabase.from('users').upsert({ id: authUser.id, username: selected, email })
          await supabase.from('streaks').upsert({ user_id: authUser.id })
        }
      } else {
        setError(authError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 6,
            color: '#e8e8f0',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          7 DAY{' '}
          <span style={{ color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>
            DISCIPLINE
          </span>
        </h1>
        <p style={{ color: '#555570', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
          Intizom · Rivojlanish · G'alaba
        </p>
      </div>

      {/* User selection */}
      {!selected ? (
        <div style={{ width: '100%', maxWidth: 480 }}>
          <p
            style={{
              textAlign: 'center',
              color: '#8888aa',
              fontSize: 13,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            Kim siz?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {USERS.map(u => (
              <button
                key={u.id}
                onClick={() => setSelected(u.id)}
                style={{
                  background: u.bg,
                  border: `1px solid ${u.color}40`,
                  borderRadius: 16,
                  padding: '32px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = u.glow
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = u.color
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = `${u.color}40`
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    border: `2px solid ${u.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: u.color,
                    boxShadow: u.glow,
                    background: `${u.color}15`,
                  }}
                >
                  {u.id === 'muhammadyusuf' ? 'MY' : 'SH'}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: u.color,
                    letterSpacing: 1,
                  }}
                >
                  {u.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Login form */
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Back */}
          <button
            onClick={() => { setSelected(null); setError('') }}
            style={{
              background: 'none',
              border: 'none',
              color: '#555570',
              fontSize: 12,
              cursor: 'pointer',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            ← Orqaga
          </button>

          <div
            style={{
              background: user?.bg,
              border: `1px solid ${user?.color}30`,
              borderRadius: 16,
              padding: 32,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `2px solid ${user?.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: user?.color,
                  boxShadow: user?.glow,
                  background: `${user?.color}15`,
                }}
              >
                {selected === 'muhammadyusuf' ? 'MY' : 'SH'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: user?.color }}>
                  {user?.label}
                </div>
                <div style={{ fontSize: 11, color: '#555570', letterSpacing: 1 }}>
                  EMAIL VA PAROL
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${user?.color}25`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: '#e8e8f0',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  width: '100%',
                }}
                onFocus={e => { e.target.style.borderColor = `${user?.color}70` }}
                onBlur={e => { e.target.style.borderColor = `${user?.color}25` }}
              />
              <input
                type="password"
                placeholder="Parol"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${user?.color}25`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: '#e8e8f0',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  width: '100%',
                }}
                onFocus={e => { e.target.style.borderColor = `${user?.color}70` }}
                onBlur={e => { e.target.style.borderColor = `${user?.color}25` }}
              />

              {error && (
                <p style={{ color: '#ff6b6b', fontSize: 12, textAlign: 'center' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: `${user?.color}20`,
                  border: `1px solid ${user?.color}`,
                  borderRadius: 8,
                  padding: '11px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: user?.color,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Orbitron', monospace",
                  boxShadow: loading ? 'none' : user?.glow,
                  marginTop: 4,
                }}
              >
                {loading ? '...' : 'Kirish →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
