// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CooperadoraDAO.sol";

/**
 * @title VotacionPropuesta
 * @dev Contrato para gestionar votaciones individuales de propuestas de gasto en la DAO
 * @notice Cada propuesta de gasto crea una instancia separada de este contrato
 */
contract VotacionPropuesta {
    
    // ============ VARIABLES DE ESTADO ============
    
    /// @dev Direccion del contrato padre CooperadoraDAO
    address public daoPadre;
    
    /// @dev Tipo de propuesta (GASTO_MENOR, GASTO_MODERADO, GASTO_MAYOR)
    CooperadoraDAO.TipoPropuesta public tipoPropuesta;

    /// @dev Informacion basica de la propuesta
    string public titulo;
    string public descripcion;
    uint256 public monto;
    address public destinatario;

    /// @dev Configuracion temporal de la votacion
    uint256 public inicioTiempo;
    uint256 public finTiempo;
    
    /// @dev Requisitos para aprobacion
    uint256 public quorum;           // Minimo de tokens que deben votar
    uint256 public mayoriaRequerida; // Porcentaje minimo de votos a favor
    
    /// @dev Contadores de votos
    uint256 public votosAFavor;
    uint256 public votosEnContra;
    
    /// @dev Direccion del creador de la propuesta
    address public creador;
    
    /// @dev Estado de ejecucion de la propuesta
    bool public ejecutada;

    /// @dev Mapping para evitar votos duplicados
    mapping(address => bool) public yaVoto;

    // ============ EVENTOS ============
    
    /**
     * @dev Emitido cuando un usuario vota
     * @param votante Direccion del votante
     * @param aFavor True si vota a favor, false en contra
     * @param tokens Cantidad de tokens utilizados en el voto
     */
    event VotoEmitido(address indexed votante, bool aFavor, uint256 tokens);
    
    /**
     * @dev Emitido cuando la propuesta se ejecuta exitosamente
     */
    event PropuestaEjecutada();
    
    /**
     * @dev Evento de debug para desarrollo y testing
     * @param mensaje Descripcion del debug
     * @param valor Valor numerico asociado
     */
    event Debug(string mensaje, uint256 valor);

    // ============ CONSTRUCTOR ============
    
    /**
     * @dev Inicializa una nueva propuesta de votacion
     * @param _titulo Titulo descriptivo de la propuesta
     * @param _descripcion Descripcion detallada de la propuesta
     * @param _monto Monto de fondos solicitados
     * @param _destinatario Direccion que recibira los fondos
     * @param _inicioTiempo Timestamp de inicio de votacion
     * @param _finTiempo Timestamp de fin de votacion
     * @param _quorum Minimo de tokens requeridos para quorum
     * @param _mayoriaRequerida Porcentaje minimo requerido para aprobacion
     * @param _tipoPropuesta Tipo de propuesta (menor, moderado, mayor)
     * @param _creador Direccion del creador de la propuesta
     * @param _daoPadre Direccion del contrato DAO padre
     */
    constructor(
        string memory _titulo,
        string memory _descripcion,
        uint256 _monto,
        address _destinatario,
        uint256 _inicioTiempo,
        uint256 _finTiempo,
        uint256 _quorum,
        uint256 _mayoriaRequerida,
        CooperadoraDAO.TipoPropuesta _tipoPropuesta,
        address _creador,
        address _daoPadre
    ) {
        // Validaciones basicas (en produccion agregar mas)
        require(_inicioTiempo < _finTiempo, "Periodo de votacion invalido");
        require(_monto > 0, "Monto debe ser mayor a cero");
        require(_destinatario != address(0), "Destinatario invalido");
        require(_daoPadre != address(0), "DAO padre invalido");

        // Asignacion de parametros
        titulo = _titulo;
        descripcion = _descripcion;
        monto = _monto;
        destinatario = _destinatario;
        inicioTiempo = _inicioTiempo;
        finTiempo = _finTiempo;
        quorum = _quorum;
        mayoriaRequerida = _mayoriaRequerida;
        tipoPropuesta = _tipoPropuesta;
        creador = _creador;
        daoPadre = _daoPadre;
    }

    // ============ FUNCIONES PUBLICAS ============
    
    /**
     * @dev Permite a un miembro votar en la propuesta
     * @notice El peso del voto es proporcional a los tokens poseidos
     * @param aFavor True para votar a favor, false para votar en contra
     * @param poderVoto Cantidad de tokens que representa el poder de voto
     */
    function votar(bool aFavor, uint256 poderVoto) external {
        // Debug info para desarrollo
        emit Debug("Tiempo actual", block.timestamp);
        emit Debug("Inicio votacion", inicioTiempo);
        emit Debug("Fin votacion", finTiempo);

        // Validaciones de tiempo
        require(inicioTiempo < finTiempo, "Periodo de votacion invalido");
        require(block.timestamp >= inicioTiempo, "Votacion no iniciada");
        require(block.timestamp <= finTiempo, "Votacion finalizada");
        require(!yaVoto[msg.sender], "Ya voto");
        require(poderVoto > 0, "El poder de voto debe ser mayor a cero");

        // Registrar voto
        yaVoto[msg.sender] = true;
        
        if (aFavor) {
            votosAFavor += poderVoto;
        } else {
            votosEnContra += poderVoto;
        }

        emit VotoEmitido(msg.sender, aFavor, poderVoto);
    }

    /**
     * @dev Ejecuta la propuesta si se cumplen los requisitos
     * @notice Version basica que solo marca como ejecutada
     */
    function ejecutarPropuesta() external {
        _validarEjecucion();
        
        // Marcar como ejecutada (version simplificada)
        ejecutada = true;
        emit PropuestaEjecutada();
    }

    /**
     * @dev Ejecuta la propuesta y realiza la transferencia de fondos
     * @notice Version completa que interactua con la tesoreria
     */
    function ejecutarConTransferencia() external {
        _validarEjecucion();

        // Llamar al DAO padre para transferir fondos desde la tesoreria
        (bool exito, ) = daoPadre.call(
            abi.encodeWithSignature(
                "transferirFondosPropuesta(address,uint256)", 
                destinatario, 
                monto
            )
        );
        
        require(exito, "Transferencia de fondos fallida");
        ejecutada = true;
        emit PropuestaEjecutada();
    }

    // ============ FUNCIONES DE CONSULTA ============
    
    /**
     * @dev Verifica si una direccion ya ha votado
     * @param _votante Direccion a verificar
     * @return True si ya voto, false en caso contrario
     */
    function haVotado(address _votante) external view returns (bool) {
        return yaVoto[_votante];
    }

    /**
     * @dev Obtiene estadisticas completas de la votacion
     * @return _votosAFavor Total de tokens votados a favor
     * @return _votosEnContra Total de tokens votados en contra
     * @return _quorum Quorum requerido para la propuesta
     * @return _mayoriaRequerida Mayoria porcentual requerida
     * @return _haFinalizado Si la votacion ha finalizado
     * @return _quorumAlcanzado Si se alcanzo el quorum
     * @return _mayoriaAlcanzada Si se alcanzo la mayoria requerida
     */
    function obtenerEstadisticasVotacion() external view returns (
        uint256 _votosAFavor,
        uint256 _votosEnContra,
        uint256 _quorum,
        uint256 _mayoriaRequerida,
        bool _haFinalizado,
        bool _quorumAlcanzado,
        bool _mayoriaAlcanzada
    ) {
        uint256 votosTotales = votosAFavor + votosEnContra;
        uint256 porcentajeAFavor = votosTotales > 0 ? (votosAFavor * 100) / votosTotales : 0;
        
        return (
            votosAFavor,
            votosEnContra,
            quorum,
            mayoriaRequerida,
            block.timestamp > finTiempo,
            votosTotales >= quorum,
            porcentajeAFavor >= mayoriaRequerida
        );
    }

    /**
     * @dev Obtiene informacion del estado temporal de la votacion
     * @return tiempoActual Timestamp actual
     * @return inicioVotacion Timestamp de inicio
     * @return finVotacion Timestamp de fin
     * @return estaActiva Si la votacion esta actualmente activa
     */
    function obtenerEstadoVotacion() public view returns (
        uint256 tiempoActual,
        uint256 inicioVotacion,
        uint256 finVotacion,
        bool estaActiva
    ) {
        return (
            block.timestamp,
            inicioTiempo,
            finTiempo,
            (block.timestamp >= inicioTiempo && block.timestamp <= finTiempo)
        );
    }

    /**
     * @dev Obtiene todos los detalles de la propuesta
     * @return _titulo Titulo de la propuesta
     * @return _descripcion Descripcion detallada
     * @return _monto Monto solicitado
     * @return _destinatario Direccion destinataria
     * @return _inicioTiempo Inicio de votacion
     * @return _finTiempo Fin de votacion
     * @return _votosAFavor Votos a favor acumulados
     * @return _votosEnContra Votos en contra acumulados
     * @return _ejecutada Estado de ejecucion
     * @return _creador Creador de la propuesta
     */
    function obtenerDetallesPropuesta() external view returns (
        string memory _titulo,
        string memory _descripcion,
        uint256 _monto,
        address _destinatario,
        uint256 _inicioTiempo,
        uint256 _finTiempo,
        uint256 _votosAFavor,
        uint256 _votosEnContra,
        bool _ejecutada,
        address _creador
    ) {
        return (
            titulo,
            descripcion,
            monto,
            destinatario,
            inicioTiempo,
            finTiempo,
            votosAFavor,
            votosEnContra,
            ejecutada,
            creador
        );
    }

    // ============ FUNCIONES INTERNAS ============
    
    /**
     * @dev Valida las condiciones para ejecutar la propuesta
     * @notice Reutilizado por ambas funciones de ejecucion
     */
    function _validarEjecucion() internal view {
        require(block.timestamp > finTiempo, "Votacion aun en curso");
        require(!ejecutada, "Propuesta ya ejecutada");

        uint256 votosTotales = votosAFavor + votosEnContra;
        require(votosTotales >= quorum, "Quorum no alcanzado");

        uint256 porcentajeAFavor = (votosAFavor * 100) / votosTotales;
        require(porcentajeAFavor >= mayoriaRequerida, "Mayoria no alcanzada");
    }
}