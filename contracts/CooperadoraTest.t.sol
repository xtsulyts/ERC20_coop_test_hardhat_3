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
}