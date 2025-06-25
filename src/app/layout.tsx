import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Socrani - Skip the Line. Escape the Job Queue.',
  description: 'Socrani helps everyone grow their business and employment web. Discover our services and see how we can help you succeed.',
  keywords: ['web development', 'mobile apps', 'cloud solutions', 'digital agency', 'employment', 'business', 'business growth', 'employment growth'],
  authors: [{ name: 'Socrani' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 