import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Socrani Agency - Digital Solutions for Modern Businesses',
  description: 'Socrani Agency helps businesses grow with innovative web, mobile, and cloud solutions. Discover our services and see how we can help you succeed.',
  keywords: ['web development', 'mobile apps', 'cloud solutions', 'digital agency'],
  authors: [{ name: 'Socrani Agency' }],
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