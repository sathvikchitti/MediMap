import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-surface px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <span className="font-playfair text-2xl font-bold text-primary">MediMap</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-16 grid grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-playfair text-5xl font-bold text-primary leading-tight mb-6">
            Your Health Records,<br />Finally Make Sense.
          </h1>
          <p className="text-muted text-lg mb-8 leading-relaxed">
            Upload your medical reports. Understand your values. Track your health over time — all in one place.
          </p>
          <div className="flex items-center gap-4 mb-10">
            <Link href="/register" className="btn-primary">Get Started Free</Link>
            <Link href="#how" className="btn-outline">See How It Works</Link>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <span>✓ 10,000+ Reports Analyzed</span>
            <span>✓ Plain Language Insights</span>
            <span>✓ Built for Indian Patients</span>
          </div>
        </div>

        {/* Mock report card */}
        <div className="card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-playfair font-semibold text-primary">Complete Blood Count</p>
              <p className="text-xs text-muted">Apollo Diagnostics · 8 June 2025</p>
            </div>
            <span className="bg-status-amber/10 text-status-amber text-xs px-3 py-1 rounded-full border border-status-amber/20 font-medium">
              2 Abnormal
            </span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Hemoglobin', value: '14.5 g/dL', status: 'normal' },
              { name: 'WBC Count', value: '10,570 /cmm', status: 'high' },
              { name: 'RBC Count', value: '4.79 M/cmm', status: 'normal' },
              { name: 'Platelets', value: '2.1L /cmm', status: 'normal' },
            ].map(row => (
              <div key={row.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-primary">{row.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary">{row.value}</span>
                  <span className={row.status === 'high' ? 'status-high' : 'status-normal'}>
                    {row.status === 'high' ? 'High' : 'Normal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-md">
            <p className="text-xs text-accent font-medium">⚠ AI Analysis: Elevated WBC may indicate infection. Consider a follow-up in 4 weeks.</p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="how" className="bg-surface border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-8">
          <p className="font-sans text-xs font-bold tracking-widest text-accent uppercase mb-3">The Problem</p>
          <h2 className="font-playfair text-3xl font-bold text-primary mb-12">
            Medical reports shouldn't require a medical degree.
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: '📂', title: 'Reports get lost', desc: 'Scattered across clinics, WhatsApp chats, and random folders.' },
              { icon: '❓', title: 'Numbers mean nothing', desc: 'HbA1c, WBC, TSH — without context, they\'re just numbers.' },
              { icon: '📅', title: 'Follow-ups get missed', desc: 'No one reminds you which tests are due and when.' },
            ].map(card => (
              <div key={card.title} className="card">
                <span className="text-2xl mb-3 block">{card.icon}</span>
                <h3 className="font-sans font-semibold text-primary mb-2">{card.title}</h3>
                <p className="text-sm text-muted">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <p className="font-sans text-xs font-bold tracking-widest text-accent uppercase mb-3">What MediMap Does</p>
        <h2 className="font-playfair text-3xl font-bold text-primary mb-12">
          From uploaded report to full health picture.
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            { title: 'Smart OCR Extraction', desc: 'Upload any PDF or scan. We extract every value automatically using AI.' },
            { title: 'Plain Language Analysis', desc: 'AI explains what\'s abnormal, the risk level, and what you should do next.' },
            { title: 'Longitudinal Tracking', desc: 'See how your hemoglobin, glucose, and TSH trend over 3M, 6M, 1Y.' },
            { title: 'Test Gap Detection', desc: 'Based on your conditions, we tell you which tests you\'re missing and when they\'re due.' },
          ].map(f => (
            <div key={f.title} className="card flex gap-4">
              <span className="text-accent mt-0.5">◆</span>
              <div>
                <h3 className="font-sans font-semibold text-primary mb-1">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-playfair text-xl font-bold">MediMap</span>
            <p className="text-sm text-white/60 mt-1">Health intelligence for every patient.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Get Started</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 text-xs text-white/40">
          Built for patients in Hyderabad, India. Not a substitute for professional medical advice.
        </div>
      </footer>
    </div>
  )
}
