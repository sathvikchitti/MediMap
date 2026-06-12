import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import HealthCharts from './HealthCharts'
import TimeRangeSelector from './TimeRangeSelector'

export default async function HealthOverviewPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const { data: conditions } = await supabase.from('user_conditions').select('*').eq('user_id', user.id)

  const { data: allValues } = await supabase
    .from('report_values')
    .select('*, reports(test_date, report_name)')
    .eq('user_id', user.id)
    .order('test_date', { ascending: true })

  const { data: recommendedTests } = await supabase
    .from('recommended_tests')
    .select('*')
    .eq('user_id', user.id)
    .order('next_due_date', { ascending: true })

  const parameterTrends: Record<string, { date: string; value: number; unit: string }[]> = {}
  ;(allValues || []).forEach(v => {
    if (v.value && v.test_date) {
      if (!parameterTrends[v.parameter_name]) parameterTrends[v.parameter_name] = []
      parameterTrends[v.parameter_name].push({ date: v.test_date, value: v.value, unit: v.unit || '' })
    }
  })

  const trendableParams = Object.entries(parameterTrends)
    .filter(([, data]) => data.length >= 2)
    .slice(0, 4)

  const statusBadge = (status: string) => {
    if (status === 'On Track') return 'status-normal'
    if (status === 'Due Soon') return 'status-low'
    return 'status-high'
  }

  const doctors = [
    { name: 'Dr. Ramesh Babu', specialty: 'Diabetologist', exp: '18 years', location: 'Jubilee Hills', rating: '4.8' },
    { name: 'Dr. Priya Sharma', specialty: 'Endocrinologist', exp: '14 years', location: 'Banjara Hills', rating: '4.7' },
    { name: 'Dr. Suresh Rao', specialty: 'General Physician', exp: '22 years', location: 'Kukatpally', rating: '4.9' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={profile?.full_name || undefined} />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-primary">Health Overview</h1>
            <p className="text-muted text-sm mt-1">Your complete health picture across all reports.</p>
          </div>
          <TimeRangeSelector />
        </div>

        {/* Trends */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Longitudinal Tracking</p>
          <h2 className="font-playfair text-xl font-bold text-primary mb-6">How your values are changing over time</h2>

          {trendableParams.length > 0 ? (
            <HealthCharts trendableParams={trendableParams} />
          ) : (
            <div className="card text-center py-10 text-muted">
              <p className="text-sm">Upload more reports to see your health trends here.</p>
              <p className="text-xs mt-1">You need at least 2 reports with the same parameters to see trends.</p>
            </div>
          )}
        </div>

        {/* Recommended tests */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Test Gap Analysis</p>
          <h2 className="font-playfair text-xl font-bold text-primary mb-2">Tests you should be taking</h2>
          {conditions && conditions.length > 0 && (
            <p className="text-sm text-muted mb-6">Based on your {conditions.map(c => c.condition_name).join(', ')} profile and recent reports.</p>
          )}

          {!recommendedTests || recommendedTests.length === 0 ? (
            <div className="card text-center py-8 text-muted text-sm">
              No recommended tests yet. Upload a report to generate recommendations.
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-bold uppercase tracking-wide text-muted bg-surface-low">
                    <th className="text-left px-6 py-3">Test Name</th>
                    <th className="text-left px-6 py-3">Why Recommended</th>
                    <th className="text-left px-6 py-3">Frequency</th>
                    <th className="text-left px-6 py-3">Last Done</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedTests.map(test => (
                    <tr key={test.id} className="border-b border-border last:border-0 hover:bg-surface-low">
                      <td className="px-6 py-3 font-medium text-primary">{test.test_name}</td>
                      <td className="px-6 py-3 text-muted">{test.reason || '—'}</td>
                      <td className="px-6 py-3 text-muted">{test.frequency_days ? `Every ${test.frequency_days} days` : '—'}</td>
                      <td className="px-6 py-3 text-muted">
                        {test.last_done_date
                          ? new Date(test.last_done_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Never'}
                      </td>
                      <td className="px-6 py-3"><span className={statusBadge(test.status)}>{test.status}</span></td>
                      <td className="px-6 py-3">
                        {test.status === 'On Track' ? (
                          <button className="text-sm text-accent hover:underline font-medium">Learn More</button>
                        ) : (
                          <button className="text-sm text-accent hover:underline font-medium">Schedule</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Suggested doctors + Insurance */}
        <div className="grid grid-cols-2 gap-8 mt-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Specialist Discovery</p>
            <h2 className="font-playfair text-xl font-bold text-primary mb-4">Suggested Doctors in Hyderabad</h2>
            <div className="space-y-3">
              {doctors.map(doc => (
                <div key={doc.name} className="card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {doc.name.split(' ').filter((_, i) => i > 0).map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary text-sm">{doc.name}</p>
                    <p className="text-xs text-muted">{doc.specialty} · {doc.exp} · {doc.location}</p>
                    <p className="text-xs text-accent">★ {doc.rating}</p>
                  </div>
                  <button className="border border-accent text-accent text-xs px-3 py-1.5 rounded-md hover:bg-accent hover:text-white transition-colors shrink-0">Book</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Coverage Matching</p>
            <h2 className="font-playfair text-xl font-bold text-primary mb-4">Insurance Recommendations</h2>
            <div className="space-y-3">
              {[
                { name: 'Star Health Diabetes Safe', tag: 'High Match', desc: 'Covers regular HbA1c testing and related specialist consultations without waiting periods.', price: '₹8,200/year' },
                { name: 'HDFC ERGO Optima Restore', tag: null, desc: 'Comprehensive coverage with a 100% restore benefit for chronic condition management.', price: '₹10,500/year' },
                { name: 'Care Health Supreme', tag: null, desc: 'Includes OPD cover for specialist visits and diagnostic tests specific to endocrinology.', price: '₹9,800/year' },
              ].map(plan => (
                <div key={plan.name} className="card">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-primary text-sm">{plan.name}</p>
                    {plan.tag && <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded font-bold uppercase">{plan.tag}</span>}
                  </div>
                  <p className="text-xs text-muted mb-2">{plan.desc}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">~{plan.price}</p>
                    <button className="text-xs text-accent hover:underline font-medium">View Plan →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
