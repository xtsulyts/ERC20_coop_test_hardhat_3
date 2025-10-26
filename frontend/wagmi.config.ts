import { defineConfig } from '@wagmi/cli'
import { hardhat, react } from '@wagmi/cli/plugins' // ← Cambiado a hardhat

 
export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    hardhat({ // ← Usando hardhat en lugar de etherscan
      project: '../backend', // ← Asegúrate que esta ruta sea correcta
    }),
    react(),
  ],
})