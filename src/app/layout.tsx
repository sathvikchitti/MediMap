import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediMap — Health Intelligence for Every Patient',
  description: 'Upload your medical reports. Understand your values. Track your health over time.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
