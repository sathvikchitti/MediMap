import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!report) notFound()

  const { data: values } = await supabase
    .from('report_values')
    .select('*')
    .eq('report_id', params.id)
    .order('created_at')

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  const abnormalValues = values?.filter(v => v.status !== 'Normal') || []

  const statusClass = (s: string) =>
    s === 'Normal' ? 'status-normal' :
    s === 'High' || s === 'Critical High' ? 'status-high' :
    s === 'Watch' ? 'status-watch' :
    'status-low'

  const borderClass = (s: string) =>
    s === 'High' || s === 'Critical High' ? 'border-l-4 border-l-status-red' :
    s === 'Low' || s === 'Critical Low' ? 'border-l-4 border-l-status-amber' :
    s === 'Watch' ? 'border-l-4 border-l-status-amber' : ''

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={profile?.full_name || undefined} />
      <main className="ml-64 flex-1 p-8">
        <Link href="/reports" className="text-sm text-accent hover:underline mb-6 inline-block">← My Reports</Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-primary">{report.report_name}</h1>
            <p className="text-muted text-sm mt-1">
              {report.lab_name || 'Unknown lab'} · {report.test_date ? new Date(report.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date unknown'}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline text-sm">Download PDF</button>
            <button className="btn-primary text-sm">Share with Doctor</button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Total Parameters</p>
            <p className="font-playfair text-3xl font-bold text-primary">{values?.length || 0}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Abnormal Values</p>
            <p className={`font-playfair text-3xl font-bold ${report.abnormal_count > 0 ? 'text-status-red' : 'text-primary'}`}>{report.abnormal_count}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Overall Status</p>
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border border-status-amber text-status-amber rounded">
              {report.overall_status || 'Pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6 mb-8">
          {/* AI verdict */}
          <div className="col-span-3 card border-l-4 border-l-accent">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent mb-3">
              <span className="w-2 h-2 rounded-full bg-accent inline-block" /> MediMap Analysis
            </p>
            <h2 className="font-playfair text-xl font-bold text-primary mb-4">What your report is telling you</h2>
            {report.ai_summary ? (
              <p className="text-sm text-primary leading-relaxed">{report.ai_summary}</p>
            ) : (
              <p className="text-sm text-muted">Analysis not available for this report.</p>
            )}
            <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-md">
              <p className="text-xs text-accent">⚠ AI-generated summary for informational purposes only. Consult your doctor before making any medical decisions.</p>
            </div>
          </div>

          {/* Key flags */}
          <div className="col-span-2 card">
            <h2 className="font-playfair font-semibold text-primary mb-4">Values Needing Attention</h2>
            {abnormalValues.length === 0 ? (
              <p className="text-sm text-status-green">All values are within normal range. ✓</p>
            ) : (
              <div className="space-y-3">
                {abnormalValues.map(v => (
                  <div key={v.id} className={`p-3 rounded-md bg-white border border-border ${borderClass(v.status || '')}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-primary">{v.parameter_name}</p>
                      <span className={statusClass(v.status || '')}>{v.status?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-primary">{v.value} <span className="text-xs font-normal text-muted">{v.unit}</span></p>
                      <p className="text-xs text-muted">Range: {v.ref_range_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full parameters table */}
        <div className="card mb-8">
          <h2 className="font-playfair font-semibold text-primary mb-4">All Parameters</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-bold uppercase tracking-wide text-muted">
                  <th className="text-left py-2 pr-4">Parameter</th>
                  <th className="text-left py-2 pr-4">Method</th>
                  <th className="text-left py-2 pr-4">Value</th>
                  <th className="text-left py-2 pr-4">Unit</th>
                  <th className="text-left py-2 pr-4">Reference Range</th>
                  <th className="text-left py-2 pr-4">Trend</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(values || []).map(v => {
                  const trend = (v as { trend?: string }).trend
                  return (
                    <tr key={v.id} className="border-b border-border last:border-0 hover:bg-surface-low">
                      <td className="py-2 pr-4 font-medium text-primary">{v.parameter_name}</td>
                      <td className="py-2 pr-4 text-muted text-xs">{v.method || '—'}</td>
                      <td className="py-2 pr-4 font-medium">{v.value ?? v.value_text ?? '—'}</td>
                      <td className="py-2 pr-4 text-muted">{v.unit || '—'}</td>
                      <td className="py-2 pr-4 text-muted">{v.ref_range_text || '—'}</td>
                      <td className="py-2 pr-4">
                        {trend === 'up' ? <span className="text-status-red">↑</span> : trend === 'down' ? <span className="text-status-amber">↓</span> : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-2"><span className={statusClass(v.status || 'Normal')}>{v.status || 'Normal'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Next steps */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="card">
            <h2 className="font-playfair font-semibold text-primary mb-4">Recommended Next Steps</h2>
            <div className="space-y-4">
              {[
                `Schedule a brief consultation with your primary physician to discuss ${abnormalValues[0]?.parameter_name || 'your results'}.`,
                'Ensure adequate hydration and monitor for any low-grade fever over the next 72 hours.',
                `Repeat ${report.next_test_name || 'CBC'} test in 30 days to verify value normalization.`,
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  <div>
                    <p className="text-sm text-primary">{step}</p>
                    <button className="text-xs text-accent hover:underline mt-1">Add to reminders</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card text-center flex flex-col items-center justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Next Test Due</p>
            {report.next_test_date ? (
              <p className="font-playfair text-3xl font-bold text-accent mb-2">
                {new Date(report.next_test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            ) : <p className="font-playfair text-2xl font-bold text-muted mb-2">Not set</p>}
            {report.next_test_name && <p className="text-sm text-muted mb-4">Recommended follow-up: {report.next_test_name}</p>}
            <button className="btn-primary w-full text-sm">Set Reminder</button>
          </div>
        </div>
      </main>
    </div>
  )
}
