// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import NextAuthSessionProvider from '@/components/providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StackIt - Q&A Platform',
  description: 'A community-driven Q&A platform for developers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}