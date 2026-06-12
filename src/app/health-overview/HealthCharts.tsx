'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendData {
  date: string
  value: number
  unit: string
}

export default function HealthCharts({
  trendableParams,
}: {
  trendableParams: [string, TrendData[]][]
}) {
  const colors = ['#1A1A2E', '#C4793A', '#2D6A4F', '#B5382A']

  return (
    <div className="grid grid-cols-2 gap-4">
      {trendableParams.map(([paramName, data], i) => {
        const latest = data[data.length - 1]
        const prev = data[data.length - 2]
        const trend = prev ? Math.round(((latest.value - prev.value) / prev.value) * 100) : 0
        const latestValue = latest.value
        const unit = latest.unit

        const chartData = data.map(d => ({
          date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          value: d.value,
        }))

        return (
          <div key={paramName} className="card">
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-medium text-muted">{paramName}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-status-red/10 text-status-red' : trend < 0 ? 'bg-status-green/10 text-status-green' : 'bg-surface-low text-muted'}`}>
                {trend > 0 ? `↑ +${trend}%` : trend < 0 ? `↓ ${trend}%` : '→ Stable'}
              </span>
            </div>
            <p className="font-playfair text-2xl font-bold text-primary mb-3">{latestValue} <span className="text-sm font-sans font-normal text-muted">{unit}</span></p>

            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 4, fontSize: 12 }}
                  labelStyle={{ color: '#1A1A2E', fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[i % colors.length], r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}
