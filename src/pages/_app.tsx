// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

import { AuthProvider } from '../contexts/AuthContext'   // ← ensure path exists
import { ToastProvider } from '../contexts/ToastContext'

import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [client] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>              {/*  ✅ put this back */}
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

