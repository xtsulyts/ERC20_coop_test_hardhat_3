// ignition/modules/CooperadoraDAO.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CooperadoraDAOModule = buildModule("CooperadoraDAOModule", (m) => {
  
  // Parametros
  const nombreEscuela = m.getParameter("nombreEscuela", "Escuela Primaria Ejemplo");
  const totalPadres = m.getParameter("totalPadres", 100);
  const direccionTesoreria = m.getParameter(
    "direccionTesoreria", 
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );

  // ============ VALIDACION MEJORADA ============
  // Validar que la direccion de tesoreria no sea address(0)
  // Convertir a string para la comparacion
  const tesoreriaStr = direccionTesoreria.toString();
  if (tesoreriaStr === "0x0000000000000000000000000000000000000000") {
    throw new Error("La direccion de tesoreria no puede ser la direccion cero");
  }

  // Despliegue del token
  const tokenCoop = m.contract("CooperadoraToken");

  // Despliegue del DAO
  const cooperadoraDAO = m.contract("CooperadoraDAO", [
    nombreEscuela,
    totalPadres, 
    direccionTesoreria,
    tokenCoop
  ], {
    id: "CooperadoraDAO"
  });

  return { tokenCoop, cooperadoraDAO };
});

export default CooperadoraDAOModule;