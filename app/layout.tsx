import type { Metadata } from 'next'
import './globals.css'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Arcus CRM',
  description: 'CRM Inteligente para Gestão de Vendas',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ServiceWorkerRegister />
          <InstallBanner />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
