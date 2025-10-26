import { defineConfig } from '@wagmi/cli'
import { etherscan, react } from '@wagmi/cli/plugins'
import { erc20Abi } from 'viem'
import { mainnet, sepolia } from 'wagmi/chains'
import * as dotenv from 'dotenv'
dotenv.config()
 
export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'erc20',
      abi: erc20Abi,
    },
  ],
  plugins: [
    etherscan({
      apiKey: process.env.ETHERSCAN_API_KEY!,
      chainId: mainnet.id,
      contracts: [
        {
          name: 'EnsRegistry',
          address: {
            [mainnet.id]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
            [sepolia.id]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
          },
        },
      ],
    }),
    react(),
  ],
})