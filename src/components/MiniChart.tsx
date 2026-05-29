'use client'

interface Props {
  data: number[]
  color: 'cyan' | 'red'
  height?: number
}

const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

export default function MiniChart({ data, color, height = 56 }: Props) {
  const max = 7
  const c = color === 'cyan' ? '#00f5ff' : '#ff3366'
  const cDim = color === 'cyan' ? 'rgba(0,245,255,0.3)' : 'rgba(255,51,102,0.3)'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((val, i) => {
        const pct = val > 0 ? Math.max(8, Math.round((val / max) * 100)) : 4
        const isToday = i === data.length - 1
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '100%', height: height - 16 + 'px', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%',
                height: `${pct}%`,
                borderRadius: '3px 3px 0 0',
                background: val > 0
                  ? isToday
                    ? `linear-gradient(to top, ${cDim}, ${c})`
                    : `linear-gradient(to top, ${color === 'cyan' ? 'rgba(0,245,255,0.5)' : 'rgba(255,51,102,0.5)'}, ${color === 'cyan' ? 'rgba(0,245,255,0.2)' : 'rgba(255,51,102,0.2)'})`
                  : '#1e1e30',
                boxShadow: isToday && val > 0 ? (color === 'cyan' ? '0 0 8px rgba(0,245,255,0.3)' : '0 0 8px rgba(255,51,102,0.3)') : 'none',
                transition: 'height 0.5s ease',
              }} />
            </div>
            <div style={{
              fontSize: 8, color: isToday ? c : '#333350',
              fontFamily: "'Orbitron', monospace",
              letterSpacing: 0,
            }}>
              {DAYS[i]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
