'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

function getAge(dateOfBirth: string | null): string | null {
  if (!dateOfBirth) return null
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return `${age} years`
}

export default function ProfileEditForm({ profile, bmi, bmiLabel }: { profile: Profile | null, bmi: string | null, bmiLabel: string | null }) {
  const [editing, setEditing] = useState(false)
  const [editingHealth, setEditingHealth] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
    blood_group: profile?.blood_group || '',
    city: profile?.city || '',
    occupation: profile?.occupation || '',
    emergency_contact: profile?.emergency_contact || '',
    height_cm: profile?.height_cm?.toString() || '',
    weight_kg: profile?.weight_kg?.toString() || '',
  })

  const supabase = createClient()
  const age = getAge(profile?.date_of_birth || null)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function savePersonal() {
    setSaving(true)
    const payload = {
      full_name: form.full_name,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      blood_group: form.blood_group || null,
      city: form.city || null,
      occupation: form.occupation || null,
      emergency_contact: form.emergency_contact || null,
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update(payload).eq('id', user.id)

    setSaving(false)
    setEditing(false)
  }

  async function saveHealth() {
    setSaving(true)
    const payload = {
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update(payload).eq('id', user.id)

    setSaving(false)
    setEditingHealth(false)
  }

  return (
    <>
      {/* Personal Info */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-playfair text-lg font-bold text-primary">Personal Information</h2>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="text-sm text-accent hover:underline">Cancel</button>
              <button onClick={savePersonal} disabled={saving} className="btn-primary text-sm py-1.5 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-sm text-accent hover:underline">Edit</button>
          )}
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted text-xs">Full Name</p><p className="font-medium text-primary mt-0.5">{profile?.full_name || 'Not set'}</p></div>
            <div><p className="text-muted text-xs">Date of Birth</p><p className="font-medium text-primary mt-0.5">{profile?.date_of_birth || 'Not set'}</p></div>
            <div><p className="text-muted text-xs">Gender</p><p className="font-medium text-primary mt-0.5">{profile?.gender || 'Not set'}</p></div>
            <div><p className="text-muted text-xs">Blood Group</p><p className="font-medium text-primary mt-0.5">{profile?.blood_group || 'Not set'}</p></div>
            <div><p className="text-muted text-xs">City</p><p className="font-medium text-primary mt-0.5">{profile?.city || 'Not set'}</p></div>
            <div><p className="text-muted text-xs">Occupation</p><p className="font-medium text-primary mt-0.5">{profile?.occupation || 'Not set'}</p></div>
            <div className="col-span-2"><p className="text-muted text-xs">Emergency Contact</p><p className="font-medium text-primary mt-0.5">{profile?.emergency_contact || 'Not provided'}</p></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted mb-0.5 block">Full Name</label>
              <input className="input text-sm" type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted mb-0.5 block">Date of Birth</label>
              <input className="input text-sm" type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted mb-0.5 block">Gender</label>
              <select className="input text-sm" value={form.gender} onChange={e => update('gender', e.target.value)}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-0.5 block">Blood Group</label>
              <select className="input text-sm" value={form.blood_group} onChange={e => update('blood_group', e.target.value)}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-0.5 block">City</label>
              <input className="input text-sm" type="text" value={form.city} onChange={e => update('city', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted mb-0.5 block">Occupation</label>
              <input className="input text-sm" type="text" value={form.occupation} onChange={e => update('occupation', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted mb-0.5 block">Emergency Contact</label>
              <input className="input text-sm" type="text" value={form.emergency_contact} onChange={e => update('emergency_contact', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Health Metrics */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair font-semibold text-primary">Health Metrics</h2>
          {editingHealth ? (
            <div className="flex gap-2">
              <button onClick={() => setEditingHealth(false)} className="text-sm text-muted hover:text-primary">Cancel</button>
              <button onClick={saveHealth} disabled={saving} className="btn-primary text-sm py-1.5 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          ) : (
            <button onClick={() => setEditingHealth(true)} className="text-sm text-accent hover:underline">Edit</button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted mb-0.5">Height</p>
            {editingHealth ? (
              <div className="relative">
                <input className="input text-sm pr-10" type="number" value={form.height_cm} onChange={e => update('height_cm', e.target.value)} />
                <span className="absolute right-3 top-2.5 text-xs text-muted">cm</span>
              </div>
            ) : (
              <p className="text-sm font-medium text-primary">{profile?.height_cm ? `${profile.height_cm} cm` : 'Not set'}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Weight</p>
            {editingHealth ? (
              <div className="relative">
                <input className="input text-sm pr-10" type="number" value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)} />
                <span className="absolute right-3 top-2.5 text-xs text-muted">kg</span>
              </div>
            ) : (
              <p className="text-sm font-medium text-primary">{profile?.weight_kg ? `${profile.weight_kg} kg` : 'Not set'}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">BMI</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-primary">{bmi || 'Not set'}</p>
              {bmiLabel && <span className={bmiLabel === 'Normal' ? 'status-normal' : bmiLabel === 'Underweight' ? 'status-low' : 'status-high'}>{bmiLabel.toUpperCase()}</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Age</p>
            <p className="text-sm font-medium text-primary">{age || 'Not set'}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-md flex gap-2">
          <span className="text-accent text-sm shrink-0">ⓘ</span>
          <p className="text-xs text-muted">BMI is calculated using your provided height and weight. This metric helps in tailoring recommended tests and tracking overall health trends within your clinical profile.</p>
        </div>
      </div>
    </>
  )
}
