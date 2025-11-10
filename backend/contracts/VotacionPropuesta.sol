// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CooperadoraDAO.sol";

contract VotacionPropuesta {
    address public daoPadre;
    CooperadoraDAO.TipoPropuesta public tipoPropuesta;

    string public titulo;
    string public descripcion;
    uint256 public monto;
    address public destinatario;

    uint256 public inicioTiempo;
    uint256 public finTiempo;
    uint256 public quorum;
    uint256 public mayoriaRequerida;
    uint256 public votosAFavor;
    uint256 public votosEnContra;
    address public creador;
    bool public ejecutada;

    mapping(address => bool) public yaVoto;

    event VotoEmitido(address indexed votante, bool aFavor, uint256 tokens);
    event PropuestaEjecutada();
    event Debug(string mensaje, uint256 valor);

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

    function votar(bool aFavor) external {
        // Debug
        emit Debug("Tiempo actual", block.timestamp);
        emit Debug("Inicio votacion", inicioTiempo);
        emit Debug("Fin votacion", finTiempo);

        // Validaciones de tiempo
        require(inicioTiempo < finTiempo, "Periodo de votacion invalido");
        require(block.timestamp >= inicioTiempo, "Votacion no iniciada");
        require(block.timestamp <= finTiempo, "Votacion finalizada");
        require(!yaVoto[msg.sender], "Ya votó");

        // Obtener tokens del votante
        uint256 tokensPoseidos = CooperadoraDAO(daoPadre).getOwnerTokens(msg.sender);
        require(tokensPoseidos > 0, "No tiene tokens");

        yaVoto[msg.sender] = true;
        
        if (aFavor) {
            votosAFavor += tokensPoseidos;
        } else {
            votosEnContra += tokensPoseidos;
        }

        emit VotoEmitido(msg.sender, aFavor, tokensPoseidos);
    }

    function ejecutarPropuesta() external {
        require(block.timestamp > finTiempo, "Votacion en curso");
        require(!ejecutada, "Ya ejecutada");

        uint256 votosTotales = votosAFavor + votosEnContra;
        require(votosTotales >= quorum, "Quorum no alcanzado");

        uint256 porcentajeAFavor = (votosAFavor * 100) / votosTotales;
        require(porcentajeAFavor >= mayoriaRequerida, "Mayoria no alcanzada");

        // Aquí iría la lógica para transferir fondos
        // Por ahora solo marcamos como ejecutada
        ejecutada = true;
        emit PropuestaEjecutada();
    }

    // MEJORA: Función para ejecutar con transferencia real
    function ejecutarConTransferencia() external {
        require(block.timestamp > finTiempo, "Votacion en curso");
        require(!ejecutada, "Ya ejecutada");

        uint256 votosTotales = votosAFavor + votosEnContra;
        require(votosTotales >= quorum, "Quorum no alcanzado");

        uint256 porcentajeAFavor = (votosAFavor * 100) / votosTotales;
        require(porcentajeAFavor >= mayoriaRequerida, "Mayoria no alcanzada");

        // Transferir fondos desde la tesorería
        (bool exito, ) = daoPadre.call(
            abi.encodeWithSignature(
                "transferirFondosPropuesta(address,uint256)", 
                destinatario, 
                monto
            )
        );
        
        require(exito, "Transferencia fallida");
        ejecutada = true;
        emit PropuestaEjecutada();
    }

    function haVotado(address _votante) external view returns (bool) {
        return yaVoto[_votante];
    }

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

    // NUEVO: Obtener detalles completos de la propuesta
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
}