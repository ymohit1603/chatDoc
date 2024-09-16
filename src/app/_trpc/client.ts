import { AppRouter } from '@/trpc'
import { createTRPCReact } from '@trpc/react-query'
import { QueryClient } from 'react-query'

// Create an instance of React Query's QueryClient
const queryClient = new QueryClient()

// Create a TRPC React client
export const trpc = createTRPCReact<AppRouter>({})