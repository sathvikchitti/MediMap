'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Activity, FlaskConical, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'My Reports', icon: FileText },
  { href: '/health-overview', label: 'Health Overview', icon: Activity },
  { href: '/health-overview', label: 'Recommended Tests', icon: FlaskConical },
  { href: '/profile', label: 'Profile', icon: User },
]

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  return parts[0]?.charAt(0).toUpperCase() ?? ''
}

export default function Sidebar({ userName }: { userName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isDashboard = pathname === '/dashboard'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <span className="font-playfair text-xl font-bold text-primary">MediMap</span>
        {!isDashboard && (
          <p className="text-[10px] tracking-widest uppercase text-muted mt-0.5">
            CLINICAL HEALTH RECORDS
          </p>
        )}
      </div>

      {userName && (
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-playfair text-sm">
              {getInitials(userName)}
            </div>
            <div>
              <p className="text-sm font-medium text-primary">{userName}</p>
              <Link href="/profile" className="text-xs text-accent hover:underline">View Profile</Link>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 py-2.5 pr-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent/10 text-accent border-l-[3px] border-accent pl-[calc(0.75rem-3px)]'
                  : 'px-3 rounded-md text-muted hover:text-primary hover:bg-surface-low'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-2">
        <Link href="/upload" className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2.5">
          + New Report
        </Link>
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted hover:text-status-red hover:bg-status-red/5 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
