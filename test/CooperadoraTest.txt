import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

/**
 * @title Suite de Pruebas para CooperadoraTest
 * @dev Pruebas simplificadas del token ERC-20 usando Hardhat + Viem
 * @notice Pruebas básicas de funcionalidad del token Cooperadora
 */
describe("CooperadoraTest", async function () {
  // Conexión a la red de Hardhat usando Viem
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  /**
   * @dev Prueba que el token se despliega con los valores correctos
   * @notice Verifica nombre, símbolo y supply inicial
   */
  it("Debería desplegarse con nombre, símbolo y supply inicial correctos", async function () {
    const token = await viem.deployContract("CooperadoraTest");

    // Verificar metadata del token
    const nombre = await token.read.name();
    const simbolo = await token.read.symbol();
    const supplyTotal = await token.read.totalSupply();
    const decimales = await token.read.decimals();

    assert.equal(nombre, "Cooperadora Test");
    assert.equal(simbolo, "COOP-TEST");
    assert.equal(supplyTotal, 1000000n * (10n ** decimales));
  });

  /**
   * @dev Prueba la función de transferencia de tokens
   * @notice Verifica que se emite el evento Transfer y los balances se actualizan
   */
  it("Debería transferir tokens y emitir evento Transfer", async function () {
    const [cuenta1, cuenta2] = await viem.getWalletClients();
    const token = await viem.deployContract("CooperadoraTest");

    const montoTransferencia = 1000n;
    
    // Verificar que se emite el evento Transfer
    await viem.assertions.emitWithArgs(
      token.write.transfer([cuenta2.account.address, montoTransferencia]),
      token,
      "Transfer",
      [cuenta1.account.address, cuenta2.account.address, montoTransferencia]
    );

    // Verificar balance actualizado
    const balanceCuenta2 = await token.read.balanceOf([cuenta2.account.address]);
    assert.equal(balanceCuenta2, montoTransferencia);
  });

  /**
   * @dev Prueba la función mint (solo owner)
   * @notice Verifica que el owner puede crear nuevos tokens
   */
  it("Debería permitir al owner mintear nuevos tokens", async function () {
    const [owner, usuario] = await viem.getWalletClients();
    const token = await viem.deployContract("CooperadoraTest");

    const montoMint = 500n;
    const balanceInicial = await token.read.balanceOf([usuario.account.address]);

    // Owner mintea tokens para el usuario
    await viem.assertions.emitWithArgs(
      token.write.mint([usuario.account.address, montoMint]),
      token,
      "Transfer",
      ["0x0000000000000000000000000000000000000000", usuario.account.address, montoMint]
    );

    const balanceFinal = await token.read.balanceOf([usuario.account.address]);
    assert.equal(balanceFinal, balanceInicial + montoMint);
  });

  /**
   * @dev Prueba la función burn
   * @notice Verifica que los usuarios pueden quemar sus tokens
   */
  it("Debería permitir a usuarios quemar sus tokens", async function () {
    const [owner] = await viem.getWalletClients();
    const token = await viem.deployContract("CooperadoraTest");

    const montoBurn = 200n;
    const balanceInicial = await token.read.balanceOf([owner.account.address]);
    const supplyInicial = await token.read.totalSupply();

    // Owner quema algunos tokens
    await viem.assertions.emitWithArgs(
      token.write.burn([montoBurn]),
      token,
      "Transfer",
      [owner.account.address, "0x0000000000000000000000000000000000000000", montoBurn]
    );

    const balanceFinal = await token.read.balanceOf([owner.account.address]);
    const supplyFinal = await token.read.totalSupply();

    assert.equal(balanceFinal, balanceInicial - montoBurn);
    assert.equal(supplyFinal, supplyInicial - montoBurn);
  });

  /**
   * @dev Prueba el registro de eventos de transferencia
   * @notice Verifica que todos los eventos de transferencia suman correctamente
   */
  it("La suma de todos los eventos Transfer debería igualar los cambios de balance", async function () {
    const [cuenta1, cuenta2, cuenta3] = await viem.getWalletClients();
    const token = await viem.deployContract("CooperadoraTest");
    const blockNumeroDespliegue = await publicClient.getBlockNumber();

    // Realizar múltiples transferencias
    await token.write.transfer([cuenta2.account.address, 100n]);
    await token.write.transfer([cuenta3.account.address, 50n]);
    await token.write.transfer([cuenta2.account.address, 25n]);

    // Obtener todos los eventos Transfer
    const eventos = await publicClient.getContractEvents({
      address: token.address,
      abi: token.abi,
      eventName: "Transfer",
      fromBlock: blockNumeroDespliegue,
      strict: true,
    });

    // Calcular total transferido desde cuenta1
    let totalTransferido = 0n;
    for (const evento of eventos) {
      if (evento.args.from === cuenta1.account.address) {
        totalTransferido += evento.args.value || 0n;
      }
    }

    // Verificar que el total transferido coincide con la reducción de balance
    const balanceFinal = await token.read.balanceOf([cuenta1.account.address]);
    const balanceInicial = await token.read.totalSupply(); // Inicialmente todo en cuenta1
    
    assert.equal(totalTransferido, balanceInicial - balanceFinal);
  });

  /**
   * @dev Prueba que no se permiten transferencias de monto cero
   * @notice Verifica la validación personalizada del contrato
   */
  it("NO debería permitir transferencias de monto cero", async function () {
    const [cuenta1, cuenta2] = await viem.getWalletClients();
    const token = await viem.deployContract("CooperadoraTest");

    // Intentar transferencia de monto cero - debería fallar
    await assert.rejects(
      token.write.transfer([cuenta2.account.address, 0]),
      {
        name: "Error",
        message: /Amount must be greater than 0/
      }
    );
  });
});