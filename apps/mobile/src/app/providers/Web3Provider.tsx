import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from "@/src/shared";
import WagmiProvider from "@/src/app/providers/WagmiProvider";

const queryClient = new QueryClient();

interface Props {
  children: ReactNode
}
export const Web3Provider = ({ children }: Props) => {
  return (
    <WagmiProvider>
      <QueryClientProvider client={queryClient}>
        { children }
      </QueryClientProvider>
    </WagmiProvider>
  )
}