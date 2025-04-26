// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useState } from 'react'
import { ToastProvider } from '../contexts/ToastContext'

import '../styles/globals.css'          // Tailwind base styles

function MyApp({ Component, pageProps }: AppProps) {
  // ensure QueryClient is created only once per browser tab
  const [client] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default MyApp

