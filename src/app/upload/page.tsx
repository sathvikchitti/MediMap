'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { CloudUpload, Pencil } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import type { ExtractedValue } from '@/types'

const REPORT_TYPES = ['Blood Test', 'Thyroid', 'Lipid Profile', 'Diabetes', 'Urine', 'Liver Function', 'Kidney Function', 'Other']

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [reportType, setReportType] = useState('')
  const [labName, setLabName] = useState('')
  const [testDate, setTestDate] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedValue[]>([])
  const [reportId, setReportId] = useState('')
  const [error, setError] = useState('')
  const [addingRow, setAddingRow] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newRow, setNewRow] = useState({ parameter_name: '', value: '', unit: '', ref_range_text: '', status: 'Normal' })
  const [saving, setSaving] = useState(false)

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setFile(files[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': [], 'image/jpeg': [], 'image/png': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  async function handleExtract() {
    if (!file) { setError('Please select a file'); return }
    setExtracting(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('report_type', reportType)
      fd.append('lab_name', labName)
      fd.append('test_date', testDate)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setReportId(data.report_id)

      if (data.extraction_failed) {
        setError('Automatic extraction is temporarily unavailable. Enter values manually using "+ Add Value".')
        setExtracted([])
        return
      }

      const extractedValues = data.extracted_parameters || data.extraction?.values || []
      setExtracted(extractedValues)

      if (extractedValues.length === 0) {
        setError('No values could be extracted from this report. Add them manually using "+ Add Value".')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setExtracting(false)
    }
  }

  function updateValue(index: number, field: string, value: string) {
    setExtracted(prev => prev.map((v, i) => i === index ? { ...v, [field]: field === 'value' ? parseFloat(value) || 0 : value } : v))
  }

  function addNewRow() {
    if (!newRow.parameter_name) return
    setExtracted(prev => [...prev, { parameter_name: newRow.parameter_name, value: parseFloat(newRow.value) || undefined, unit: newRow.unit, ref_range_text: newRow.ref_range_text, status: newRow.status as ExtractedValue['status'] }])
    setNewRow({ parameter_name: '', value: '', unit: '', ref_range_text: '', status: 'Normal' })
    setAddingRow(false)
  }

  async function handleSave() {
    if (!reportId) return
    setSaving(true)
    await fetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId, values: extracted }),
    })
    router.push(`/reports/${reportId}`)
  }

  const statusClass = (s: string) =>
    s === 'Normal' ? 'status-normal' :
    s === 'High' || s === 'Critical High' ? 'status-high' :
    s === 'Watch' ? 'status-watch' :
    'status-low'

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="font-playfair text-3xl font-bold text-primary mb-1">Upload Report</h1>
        <p className="text-muted text-sm mb-6">We&apos;ll extract all values automatically using AI</p>

        <div className="grid grid-cols-2 gap-8">
          {/* Left: upload */}
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent'}`}
            >
              <input {...getInputProps()} />
              <CloudUpload size={36} className="text-accent mx-auto mb-3" />
              {file ? (
                <p className="font-medium text-primary text-sm">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-primary font-medium mb-1">Drag & drop your report here</p>
                  <p className="text-sm text-muted">or <span className="text-accent hover:underline cursor-pointer">browse files</span></p>
                </>
              )}
              <p className="text-xs text-muted mt-3">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Report Type</label>
                <select className="input" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="">Select type</option>
                  {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Lab Name</label>
                <input className="input" value={labName} onChange={e => setLabName(e.target.value)} placeholder="e.g. Apollo Diagnostics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Test Date</label>
                <input className="input" type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-sm text-status-red bg-status-red/5 border border-status-red/20 rounded-md px-3 py-2">{error}</p>}

            <button onClick={handleExtract} disabled={!file || extracting} className="btn-primary w-full disabled:opacity-50">
              {extracting ? '⏳ Extracting report values...' : 'Extract Values →'}
            </button>
          </div>

          {/* Right: extracted values */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-2xl font-bold text-primary">Extracted Values</h2>
              {extracted.length > 0 && (
                <button onClick={() => setAddingRow(true)} className="text-sm border border-accent text-accent px-3 py-1.5 rounded-md hover:bg-accent hover:text-white transition-colors">+ Add Value</button>
              )}
            </div>
            {extracted.length > 0 && (
              <p className="text-xs text-accent mb-4 flex items-center gap-1">
                <span>✦</span> AI extracted {extracted.length} values — review and edit before saving
              </p>
            )}

            {extracted.length === 0 && !reportId ? (
              <div className="card text-center py-16 text-muted">
                <p className="text-sm">Upload a report and click &quot;Extract Values&quot; to begin.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-bold uppercase tracking-wide text-muted">
                      <th className="text-left py-2 pr-4">Parameter</th>
                      <th className="text-left py-2 pr-4">Method</th>
                      <th className="text-left py-2 pr-4">Value</th>
                      <th className="text-left py-2 pr-4">Unit</th>
                      <th className="text-left py-2 pr-4">Ref Range</th>
                      <th className="text-left py-2 pr-4">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extracted.map((v, i) => (
                      <tr key={i} className={`border-b border-border last:border-0 ${v.status !== 'Normal' ? 'bg-status-amber/5' : ''}`}>
                        <td className="py-2 pr-4 font-medium text-primary">{v.parameter_name}</td>
                        <td className="py-2 pr-4 text-muted text-xs">{v.method || '—'}</td>
                        <td className="py-2 pr-4">
                          {editingIndex === i ? (
                            <input
                              className="w-20 border border-border rounded px-2 py-1 text-xs text-primary focus:border-accent outline-none"
                              value={v.value ?? ''}
                              onChange={e => updateValue(i, 'value', e.target.value)}
                            />
                          ) : (
                            <span className="font-medium">{v.value ?? '—'}</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-muted">{v.unit}</td>
                        <td className="py-2 pr-4 text-muted text-xs">{v.ref_range_text}</td>
                        <td className="py-2 pr-4">
                          {editingIndex === i ? (
                            <select
                              className="text-xs border border-border rounded px-1 py-1 outline-none"
                              value={v.status}
                              onChange={e => updateValue(i, 'status', e.target.value)}
                            >
                              {['Normal', 'High', 'Low', 'Critical High', 'Critical Low', 'Watch'].map(s => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={statusClass(v.status)}>{v.status}</span>
                          )}
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                            className="p-1 rounded hover:bg-surface-low text-muted hover:text-accent transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {addingRow && (
                      <tr className="border-b border-border bg-background">
                        <td className="py-2 pr-2"><input className="input text-xs py-1" placeholder="Parameter" value={newRow.parameter_name} onChange={e => setNewRow(p => ({ ...p, parameter_name: e.target.value }))} /></td>
                        <td className="py-2 pr-2 text-muted text-xs">—</td>
                        <td className="py-2 pr-2"><input className="w-20 border border-border rounded px-2 py-1 text-xs outline-none" placeholder="Value" value={newRow.value} onChange={e => setNewRow(p => ({ ...p, value: e.target.value }))} /></td>
                        <td className="py-2 pr-2"><input className="w-16 border border-border rounded px-2 py-1 text-xs outline-none" placeholder="Unit" value={newRow.unit} onChange={e => setNewRow(p => ({ ...p, unit: e.target.value }))} /></td>
                        <td className="py-2 pr-2"><input className="w-24 border border-border rounded px-2 py-1 text-xs outline-none" placeholder="e.g. 4.5–5.5" value={newRow.ref_range_text} onChange={e => setNewRow(p => ({ ...p, ref_range_text: e.target.value }))} /></td>
                        <td className="py-2 pr-2">
                          <select className="text-xs border border-border rounded px-1 py-1 outline-none" value={newRow.status} onChange={e => setNewRow(p => ({ ...p, status: e.target.value }))}>
                            {['Normal', 'High', 'Low', 'Critical High', 'Critical Low', 'Watch'].map(s => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <button onClick={addNewRow} className="text-xs bg-accent text-white px-2 py-1 rounded">Add</button>
                            <button onClick={() => setAddingRow(false)} className="text-xs text-muted hover:text-primary">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <button onClick={handleSave} disabled={saving || extracted.length === 0 || !reportId} className="w-full btn-primary text-base py-4 mt-4 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save & Analyse Report →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
