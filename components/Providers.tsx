"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import AuthProvider from "./AuthProvider"
import { Toaster } from "sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Data stays green for 1 minute
        refetchOnWindowFocus: false, // Don't refetch every time you switch browser tabs
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
