import { ethers } from "hardhat";

async function main() {
  console.log("🔍 BUSCANDO TOKENS EN TODAS LAS CUENTAS...");
  
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contract = await ethers.getContractAt("CooperadoraTest", contractAddress);
  const accounts = await ethers.getSigners();
  
  let tokensFound = false;
  
  for (let i = 0; i < accounts.length; i++) {
    const balance = await contract.balanceOf(accounts[i].address);
    if (balance > 0) {
      console.log(`🎯 TOKENS ENCONTRADOS en Cuenta #${i}: ${accounts[i].address}`);
      console.log(`   Balance: ${ethers.formatUnits(balance, 18)} tokens`);
      // Nota: No podemos acceder a la privateKey desde el script de esta manera por seguridad.
      // Pero las cuentas de Hardhat son determinísticas, así que si estás usando las cuentas por defecto, la private key de la cuenta #0 es la conocida.
      console.log(`   Private Key para importar: (usa la private key de la cuenta #${i} de Hardhat)`);
      tokensFound = true;
    }
  }
  
  if (!tokensFound) {
    console.log("❌ NO se encontraron tokens en ninguna cuenta conocida");
    console.log("Posible problema: El contrato se desplegó con otra configuración");
  }
}

main().catch(console.error);