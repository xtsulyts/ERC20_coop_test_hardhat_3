// ignition/modules/CooperadoraDAO.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Módulo de Ignition para el despliegue completo del sistema de la Cooperadora Escolar.
 * Este módulo despliega de forma secuencial y dependiente los tres contratos principales.
 */
const CooperadoraDAOModule = buildModule("CooperadoraDAOModule", (m) => {
  
  // 1. PARÁMETROS CONFIGURABLES DEL DESPLIEGUE
  // Estos valores pueden ser sobrescritos durante el despliegue usando un archivo de parámetros.
  const tokenCap = m.getParameter("tokenCap", 1000000); // Suministro máximo del token
  const nombreEscuela = m.getParameter("nombreEscuela", "Mi Escuela Ejemplo");
  const totalPadres = m.getParameter("totalPadres", 100);
  // Asume que el despliegue inicial utilizará la cuenta del desplegador como tesorería.
  // En una implementación real, considera hacerla un parámetro configurable.
  const direccionTesoreria = m.getParameter("direccionTesoreria", m.getAccount(0));

  // 2. DESPLIEGUE DEL TOKEN COOP (ERC-20)
  const tokenCoop = m.contract("CooperadoraToken", [], {
    // Nota: Si tu constructor de CooperadoraToken acepta argumentos (como un 'cap'),
    // debes pasarlos en el array de arriba. El ejemplo actual asume un constructor sin argumentos.
  });

  // 3. DESPLIEGUE DEL CONTRATO PRINCIPAL CooperadoraDAO
  // Este contrato depende de la dirección del token recién desplegado.
  const cooperadoraDAO = m.contract("CooperadoraDAO", [
    nombreEscuela,
    totalPadres,
    direccionTesoreria,
    tokenCoop, // Se pasa la instancia del token como dependencia
  ]);

  // 4. DESPLIEGUE DEL CONTRATO VotacionPropuesta (Como Ejemplo o Proxy Factory)
  // Nota: En tu arquitectura, `VotacionPropuesta` es creado dinámicamente por `CooperadoraDAO`.
  // No es necesario desplegarlo aquí de forma independiente. Este paso es ilustrativo.
  // Si necesitas una versión base o una fábrica, se desplegaría así:
  // const votacionPropuesta = m.contract("VotacionPropuesta", [...]);
  
  // El módulo expone las instancias de los contratos desplegados para su uso en pruebas o interacción.
  return { tokenCoop, cooperadoraDAO };
});

export default CooperadoraDAOModule;