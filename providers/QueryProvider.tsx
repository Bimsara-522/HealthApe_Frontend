// 'use client'

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { ReactNode, useState } from 'react'

// interface Props {
//   children: ReactNode
// }

// export function QueryProvider({ children }: Props) {
//   // Ensure client instance is stable (avoid re-creating on every render)
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 5 * 60 * 1000, // 5 minutes
//             refetchOnWindowFocus: false,
//             retry: 1,
//           },
//         },
//       })
//   )

//   return (
//     <QueryClientProvider client={queryClient}>
//       {children}
//       <ReactQueryDevtools initialIsOpen={false} />
//     </QueryClientProvider>
//   )
// }
