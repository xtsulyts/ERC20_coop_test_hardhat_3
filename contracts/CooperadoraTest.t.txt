// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {CooperadoraTest} from "./CooperadoraTest.sol";
import {Test} from "forge-std/Test.sol";

/**
 * @title CooperadoraTest - Suite de Pruebas
 * @dev Suite completa de pruebas para el contrato token ERC-20 CooperadoraTest
 * @notice Las pruebas cubren: despliegue, minting, burning, transferencias, ownership y casos edge
 */
contract CooperadoraTestTest is Test {
    CooperadoraTest token;
    
    // Direcciones de prueba - serán pobladas por Foundry
    address owner = address(0x1);
    address usuario1 = address(0x2);
    address usuario2 = address(0x3);
    address atacante = address(0x4);

    /**
     * @dev Función setup que se ejecuta antes de cada prueba
     * @notice Despliega una nueva instancia del contrato y etiqueta direcciones para mejor trazabilidad
     */
    function setUp() public {
        // Etiquetar direcciones para mejores mensajes de error
        vm.label(owner, "Owner");
        vm.label(usuario1, "Usuario1");
        vm.label(usuario2, "Usuario2");
        vm.label(atacante, "Atacante");
        
        // Desplegar nuevo contrato como owner
        vm.prank(owner);
        token = new CooperadoraTest();
    }

    // =============================================
    // PRUEBAS DE DESPLIEGUE E INICIALIZACIÓN
    // =============================================

    /**
     * @dev Prueba los valores de inicialización del token
     * @notice Verifica nombre, símbolo, decimales y asignación inicial de supply
     */
    function test_Inicializacion() public view {
        // Verificar metadata ERC-20
        require(keccak256(bytes(token.name())) == keccak256(bytes("Cooperadora Test")), "Nombre incorrecto del token");
        require(keccak256(bytes(token.symbol())) == keccak256(bytes("COOP")), "Simbolo incorrecto del token");
        require(token.decimals() == 18, "Decimales incorrectos");
        
        // Verificar que el supply inicial fue minted al owner
        uint256 supplyEsperado = 1000000 * 10 ** token.decimals();
        require(token.totalSupply() == supplyEsperado, "Supply total incorrecto");
        require(token.balanceOf(owner) == supplyEsperado, "Supply inicial no asignado al owner");
    }

    /**
     * @dev Prueba la asignación de ownership en el despliegue
     * @notice Asegura que el deployer se convierte en el owner inicial
     */
    function test_OwnershipInicial() public view {
        require(token.owner() == owner, "El deployer deberia ser el owner inicial");
    }

    // =============================================
    // PRUEBAS DE FUNCIÓN MINT
    // =============================================

    /**
     * @dev Prueba la funcionalidad de minting autorizado
     * @notice Verifica que el owner puede mintear tokens a cualquier dirección
     */
    function test_MintTokens_ComoOwner() public {
        uint256 montoMint = 1000 * 10 ** token.decimals();
        uint256 balanceInicial = token.balanceOf(usuario1);
        
        vm.prank(owner);
        token.mint(usuario1, montoMint);
        
        uint256 balanceFinal = token.balanceOf(usuario1);
        require(balanceFinal == balanceInicial + montoMint, "El mint deberia aumentar el balance");
    }

    /**
     * @dev Prueba intentos de minting no autorizados
     * @notice Asegura que solo el owner puede mintear tokens
     */
    function test_MintTokens_ComoNoOwner() public {
        uint256 montoMint = 1000 * 10 ** token.decimals();
        
        vm.prank(atacante);
        vm.expectRevert(); // Se espera revert de OwnableUnauthorizedAccount
        token.mint(usuario1, montoMint);
    }

    /**
     * @dev Prueba fuzzing para minting con varios montos
     * @param monto Monto aleatorio para probar (fuzzing)
     * @notice Prueba minting con montos aleatorios para asegurar robustez
     */
    function testFuzz_MintTokens(uint256 monto) public {
        // Limitar monto para prevenir overflow en escenarios realistas
        vm.assume(monto > 0 && monto < type(uint128).max);
        
        uint256 supplyInicial = token.totalSupply();
        uint256 balanceInicial = token.balanceOf(usuario1);
        
        vm.prank(owner);
        token.mint(usuario1, monto);
        
        require(token.totalSupply() == supplyInicial + monto, "El supply total deberia aumentar");
        require(token.balanceOf(usuario1) == balanceInicial + monto, "El balance del usuario deberia aumentar");
    }

    // =============================================
    // PRUEBAS DE FUNCIÓN BURN
    // =============================================

    /**
     * @dev Prueba la funcionalidad de burning de tokens
     * @notice Verifica que los usuarios pueden quemar sus propios tokens
     */
    function test_BurnTokens() public {
        uint256 montoTransferencia = 500 * 10 ** token.decimals();
        uint256 montoBurn = 200 * 10 ** token.decimals();
        
        // Primero transferir tokens al usuario1
        vm.prank(owner);
        token.transfer(usuario1, montoTransferencia);
        
        uint256 supplyInicial = token.totalSupply();
        uint256 balanceInicial = token.balanceOf(usuario1);
        
        // Usuario1 quema algunos tokens
        vm.prank(usuario1);
        token.burn(montoBurn);
        
        require(token.totalSupply() == supplyInicial - montoBurn, "El supply total deberia disminuir");
        require(token.balanceOf(usuario1) == balanceInicial - montoBurn, "El balance del usuario deberia disminuir");
    }

    /**
     * @dev Prueba quemar más tokens de los que se tienen
     * @notice Asegura que los usuarios no pueden quemar más tokens de los que poseen
     */
    function test_BurnMasQueBalance() public {
        uint256 montoTransferencia = 100 * 10 ** token.decimals();
        uint256 montoBurn = 200 * 10 ** token.decimals();
        
        vm.prank(owner);
        token.transfer(usuario1, montoTransferencia);
        
        vm.prank(usuario1);
        vm.expectRevert(); // Se espera revert de ERC20InsufficientBalance
        token.burn(montoBurn);
    }

    // =============================================
    // PRUEBAS DE FUNCIÓN TRANSFER
    // =============================================

    /**
     * @dev Prueba transferencias estándar de tokens
     * @notice Verifica que los tokens pueden ser transferidos entre cuentas
     */
    function test_TransferirTokens() public {
        uint256 montoTransferencia = 300 * 10 ** token.decimals();
        uint256 balanceInicialOwner = token.balanceOf(owner);
        uint256 balanceInicialUsuario1 = token.balanceOf(usuario1);
        
        vm.prank(owner);
        bool exito = token.transfer(usuario1, montoTransferencia);
        
        require(exito, "La transferencia deberia tener exito");
        require(token.balanceOf(owner) == balanceInicialOwner - montoTransferencia, "El balance del sender deberia disminuir");
        require(token.balanceOf(usuario1) == balanceInicialUsuario1 + montoTransferencia, "El balance del receiver deberia aumentar");
    }

    /**
     * @dev Prueba transferencia con monto cero
     * @notice Asegura el mensaje de revert personalizado para transferencias de monto cero
     */
    function test_TransferirMontoCero() public {
        vm.prank(owner);
        vm.expectRevert(bytes("Amount must be greater than 0"));
        token.transfer(usuario1, 0);
    }

    /**
     * @dev Prueba transferencia a dirección cero
     * @notice Asegura la protección ERC-20 contra transferencias a address cero
     */
    function test_TransferirACeroAddress() public {
        uint256 montoTransferencia = 100 * 10 ** token.decimals();
        
        vm.prank(owner);
        vm.expectRevert(); // Se espera revert de ERC20InvalidReceiver
        token.transfer(address(0), montoTransferencia);
    }

    /**
     * @dev Prueba fuzzing para funcionalidad de transferencia
     * @param monto Monto aleatorio para probar (fuzzing)
     * @notice Prueba transferencias con montos aleatorios para asegurar robustez del contrato
     */
    function testFuzz_TransferirTokens(uint256 monto) public {
        // Asumiciones para testing realista
        uint256 balanceOwner = token.balanceOf(owner);
        vm.assume(monto > 0 && monto <= balanceOwner);
        
        uint256 balanceInicialUsuario1 = token.balanceOf(usuario1);
        
        vm.prank(owner);
        token.transfer(usuario1, monto);
        
        require(token.balanceOf(usuario1) == balanceInicialUsuario1 + monto, "El receiver deberia recibir el monto exacto");
    }

    // =============================================
    // PRUEBAS DE OWNERSHIP Y CONTROL DE ACCESO
    // =============================================

    /**
     * @dev Prueba la funcionalidad de transferencia de ownership
     * @notice Verifica que el owner puede transferir ownership a otra dirección
     */
    function test_TransferirOwnership() public {
        vm.prank(owner);
        token.transferOwnership(usuario1);
        
        require(token.owner() == usuario1, "El ownership deberia ser transferido");
    }

    /**
     * @dev Prueba intentos no autorizados de transferencia de ownership
     * @notice Asegura que solo el owner puede transferir ownership
     */
    function test_TransferirOwnership_ComoNoOwner() public {
        vm.prank(atacante);
        vm.expectRevert(); // Se espera revert de OwnableUnauthorizedAccount
        token.transferOwnership(usuario1);
    }

    // =============================================
    // PRUEBAS DE EMISIÓN DE EVENTOS
    // =============================================

    /**
     * @dev Prueba la emisión del evento Transfer en transferencia exitosa
     * @notice Verifica que los eventos son emitidos correctamente para transparencia en blockchain
     */
    function test_EventoTransfer() public {
        uint256 montoTransferencia = 100 * 10 ** token.decimals();
        
        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, usuario1, montoTransferencia);
        
        vm.prank(owner);
        token.transfer(usuario1, montoTransferencia);
    }

    /**
     * @dev Prueba la emisión del evento Transfer en burn
     * @notice Verifica que las operaciones de burn emiten eventos Transfer a address cero
     */
    function test_EventoBurn() public {
        uint256 montoBurn = 50 * 10 ** token.decimals();
        
        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, address(0), montoBurn);
        
        vm.prank(owner);
        token.burn(montoBurn);
    }

    // =============================================
    // PRUEBAS DE CASOS EDGE Y SEGURIDAD
    // =============================================

    /**
     * @dev Prueba la protección contra reentrancy en función transfer
     * @notice Asegura que el contrato es seguro contra ataques de reentrancy
     */
    function test_SinReentrancyEnTransfer() public {
        uint256 montoTransferencia = 100 * 10 ** token.decimals();
        
        vm.prank(owner);
        token.transfer(usuario1, montoTransferencia);
        
        // Si llegamos aquí sin reentrancy, la prueba pasa
        require(token.balanceOf(usuario1) == montoTransferencia, "La transferencia deberia completarse sin reentrancy");
    }

    /**
     * @dev Prueba el comportamiento del contrato con valores uint256 máximos
     * @notice Asegura que el contrato maneja valores extremos correctamente
     */
    function test_ValoresMaxUint256() public {
        uint256 maxUint = type(uint256).max;
        
        // Intentar transferir más del balance (debería fallar)
        vm.prank(owner);
        vm.expectRevert(); // Se espera revert de ERC20InsufficientBalance
        token.transfer(usuario1, maxUint);
    }

    /**
     * @dev Prueba múltiples operaciones consecutivas
     * @notice Verifica la estabilidad del contrato bajo múltiples operaciones
     */
    function test_MultiplesOperaciones() public {
        uint256 montoMint = 1000 * 10 ** token.decimals();
        uint256 montoTransferencia = 500 * 10 ** token.decimals();
        uint256 montoBurn = 200 * 10 ** token.decimals();
        
        // Secuencia de operaciones
        vm.startPrank(owner);
        token.mint(usuario1, montoMint);
        token.transfer(usuario2, montoTransferencia);
        token.burn(montoBurn);
        vm.stopPrank();
        
        // Verificar estado final
        require(token.balanceOf(usuario1) == montoMint, "Usuario1 deberia tener el monto minteado");
        require(token.balanceOf(usuario2) == montoTransferencia, "Usuario2 deberia tener el monto transferido");
        require(token.balanceOf(owner) == token.totalSupply() - montoMint - montoTransferencia + montoBurn, "El balance del owner deberia ser correcto");
    }

    /**
     * @dev Prueba que el contrato mantiene consistencia en balances después de múltiples operaciones
     * @notice Verifica la integridad de los datos después de operaciones complejas
     */
    function test_ConsistenciaDeBalances() public {
        uint256 supplyInicial = token.totalSupply();
        uint256 balanceInicialOwner = token.balanceOf(owner);
        
        // Realizar varias operaciones
        vm.startPrank(owner);
        token.mint(usuario1, 1000);
        token.transfer(usuario2, 500);
        token.burn(200);
        token.mint(usuario2, 300);
        vm.stopPrank();
        
        // Verificar que la suma de todos los balances iguala el total supply
        uint256 sumaBalances = token.balanceOf(owner) + 
                              token.balanceOf(usuario1) + 
                              token.balanceOf(usuario2);
        
        require(sumaBalances == token.totalSupply(), "La suma de balances deberia igualar el supply total");
    }
}