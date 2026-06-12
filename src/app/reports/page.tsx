import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Bell } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'

export default async function ReportsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={profile?.full_name || undefined} />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 max-w-sm relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-8" placeholder="Search reports..." />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-surface-low"><Bell size={18} className="text-muted" /></button>
            <Link href="/upload" className="btn-primary text-sm">Book Appointment</Link>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-primary">My Reports</h1>
          <p className="text-muted text-sm mt-1">All your uploaded medical records in one place.</p>
        </div>

        {!reports || reports.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-muted mb-4">No reports uploaded yet.</p>
            <Link href="/upload" className="btn-primary">Upload Your First Report</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {['All', 'Blood Tests', 'Thyroid', 'Diabetes', 'Lipid', 'Other'].map(tab => (
                  <button key={tab} className={`px-3 py-1 text-sm rounded-full border transition-colors ${tab === 'All' ? 'bg-primary text-white border-primary' : 'border-border text-muted hover:border-primary hover:text-primary'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <select className="input w-auto text-sm">
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </div>

            <div className="space-y-3">
              {reports.map(report => {
                const formatted_date = report.test_date
                  ? new Date(report.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'Date unknown'
                return (
                  <div key={report.id} className="card flex items-center gap-5 hover:border-accent/50 transition-colors">
                    <div className="w-14 h-14 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-accent text-xl font-playfair font-bold">{report.report_name?.charAt(0) || 'R'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary">{report.report_name}</p>
                      <p className="text-xs text-muted mt-0.5">{report.lab_name || 'Unknown lab'} · {formatted_date}</p>
                      <div className="flex gap-2 mt-2">
                        {report.report_type && <span className="text-[10px] font-bold uppercase tracking-wider border border-border text-muted px-2 py-0.5 rounded">{report.report_type}</span>}
                        {(report as { is_routine?: boolean }).is_routine && <span className="text-[10px] font-bold uppercase tracking-wider border border-border text-muted px-2 py-0.5 rounded">ROUTINE</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={report.abnormal_count > 0 ? 'status-high' : 'status-normal'}>
                        {report.abnormal_count > 0 ? `${report.abnormal_count} Abnormal` : 'All Normal'}
                      </span>
                      <Link href={`/reports/${report.id}`} className="text-sm text-accent hover:underline font-medium">View Analysis →</Link>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center items-center gap-2 mt-8">
              <button className="px-3 py-1.5 text-sm border border-border rounded-md text-muted hover:border-primary">← Previous</button>
              {[1, 2, 3].map(n => (
                <button key={n} className={`w-8 h-8 text-sm rounded-md ${n === 1 ? 'bg-primary text-white' : 'border border-border text-muted hover:border-primary'}`}>{n}</button>
              ))}
              <button className="px-3 py-1.5 text-sm border border-border rounded-md text-muted hover:border-primary">Next →</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
