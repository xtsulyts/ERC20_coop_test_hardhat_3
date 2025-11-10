// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CooperadoraTest.sol";  // Tu token ERC20 existente
import "./VotacionPropuesta.sol";

contract CooperadoraDAO {
    struct Cooperadora {
        string nombreEscuela;
        address tesoreria;
        uint256 totalPadres;
    }

    struct Padre {
        bool estaActivo;
        address delegarA;
    }

    enum TipoPropuesta {
        GASTO_MENOR,      // < 10% presupuesto
        GASTO_MODERADO,   // 10-30% presupuesto  
        GASTO_MAYOR       // > 30% presupuesto
    }

    Cooperadora public infoCooperadora;
    address public presidente;
    CuotaToken public tokenCuota;
    mapping(address => Padre) public padres;
    mapping(uint256 => address) public propuestasVotacion; // proposalId => PropuestaVotacion
    uint256 public contadorPropuestas;
    uint256 public constant RETRASO_VOTACION = 1 days;
    uint256 public constant PERIODO_VOTACION = 7 days;

    event PropuestaCreada(uint256 indexed propuestaId, address contratoVotacion);
    event PadreAgregado(address indexed padre, uint256 tokens);
    event PadreRemovido(address indexed padre);
    event PresidenteCambiado(address indexed antiguoPresidente, address indexed nuevoPresidente);

    modifier soloPresidente() {
        require(msg.sender == presidente, "Solo presidente");
        _;
    }

    modifier soloPadre() {
        require(padres[msg.sender].estaActivo, "Solo padres activos");
        _;
    }

    constructor(
        string memory _nombreEscuela,
        uint256 _totalPadres,
        address _tesoreria,
        address _tokenExistente  // Address de tu token ya desplegado
    ) {
        presidente = msg.sender;
        infoCooperadora.nombreEscuela = _nombreEscuela;
        infoCooperadora.totalPadres = _totalPadres;
        infoCooperadora.tesoreria = _tesoreria;
        
        // Usar token existente en lugar de crear uno nuevo
        tokenCuota = CuotaToken(_tokenExistente);
    }

    // FUNCIÓN CLAVE: Presidente agrega padres después de pago fiat
    function agregarPadre(address _padre, uint256 _cantidadTokens) public soloPresidente {
        require(!padres[_padre].estaActivo, "Ya es padre");
        require(_cantidadTokens > 0, "Cantidad debe ser mayor a 0");
        
        padres[_padre].estaActivo = true;
        
        // Mint tokens proporcional a cuotas pagadas
        tokenCuota.mint(_padre, _cantidadTokens);
        
        emit PadreAgregado(_padre, _cantidadTokens);
    }

    function crearPropuestaGasto(
        string memory _titulo,
        string memory _descripcion,
        uint256 _monto,
        address _destinatario,
        TipoPropuesta _tipo
    ) public soloPadre returns (uint256) {
        require(bytes(_titulo).length > 0, "Titulo no puede estar vacio");
        require(bytes(_descripcion).length > 0, "Descripcion no puede estar vacio");
        require(tokenCuota.balanceOf(msg.sender) > 0, "No tiene tokens");
        require(_monto > 0, "Monto debe ser mayor a 0");

        // Calcular quórum y mayoría según tipo
        uint256 quorum;
        uint256 mayoriaRequerida;

        if (_tipo == TipoPropuesta.GASTO_MENOR) {
            quorum = (tokenCuota.totalSupply() * 25) / 100; // 25% tokens
            mayoriaRequerida = 51; // 51% a favor
        } else if (_tipo == TipoPropuesta.GASTO_MODERADO) {
            quorum = (tokenCuota.totalSupply() * 40) / 100; // 40% tokens  
            mayoriaRequerida = 60; // 60% a favor
        } else if (_tipo == TipoPropuesta.GASTO_MAYOR) {
            quorum = (tokenCuota.totalSupply() * 60) / 100; // 60% tokens
            mayoriaRequerida = 75; // 75% a favor
        }

        uint256 inicioTiempo = block.timestamp + RETRASO_VOTACION;
        uint256 finTiempo = inicioTiempo + PERIODO_VOTACION;

        // Crear nuevo contrato de votación
       VotacionPropuesta nuevaVotacion = new VotacionPropuesta(
        _titulo,
        _descripcion,
        _monto,
        _destinatario,
        inicioTiempo,
        finTiempo,
        quorum,
        mayoriaRequerida,
        _tipo,
        msg.sender,
        address(this)
    );

    uint256 propuestaId = contadorPropuestas++;
    propuestasVotacion[propuestaId] = address(nuevaVotacion);
    
    emit PropuestaCreada(propuestaId, address(nuevaVotacion));
    return propuestaId;
}
    }

    // Votar en una propuesta
    function votar(uint256 _propuestaId, bool _aFavor) external soloPadre {
        address direccionVotacion = propuestasVotacion[_propuestaId];
        require(direccionVotacion != address(0), "Propuesta no existe");
        
        uint256 poderVoto = tokenCuota.balanceOf(msg.sender);
        PropuestaVotacion(direccionVotacion).votar(_aFavor, poderVoto);
    }

    // Obtener poder de voto (incluye delegaciones)
    function obtenerPoderVoto(address _padre) public view returns (uint256) {
        uint256 poderPropio = tokenCuota.balanceOf(_padre);
        
        // Sumar tokens delegados
        for (uint256 i = 0; i < infoCooperadora.totalPadres; i++) {
            // Nota: En implementación real usarías un array de padres
            address delegador = obtenerPadrePorIndice(i);
            if (padres[delegador].delegarA == _padre) {
                poderPropio += tokenCuota.balanceOf(delegador);
            }
        }
        
        return poderPropio;
    }

    // Delegar voto
    function delegarVoto(address _a) public soloPadre {
        require(_a != msg.sender, "No auto-delegacion");
        require(padres[_a].estaActivo, "Solo puede delegar a padres activos");
        padres[msg.sender].delegarA = _a;
    }

    // Funciones de utilidad
    function obtenerContratoVotacion(uint256 _propuestaId) public view returns (address) {
        return propuestasVotacion[_propuestaId];
    }

    function obtenerPadresActivos() public view returns (address[] memory) {
        // Implementación para obtener lista de padres activos
    }

    // Función auxiliar temporal (para testing)
    function cambiarPresidente(address _nuevoPresidente) public soloPresidente {
        address antiguoPresidente = presidente;
        presidente = _nuevoPresidente;
        emit PresidenteCambiado(antiguoPresidente, _nuevoPresidente);
    }

    // Función helper (necesitarías mantener un array de padres)
    function obtenerPadrePorIndice(uint256 index) internal view returns (address) {
        // Implementación dependiente de cómo almacenes los padres
        return address(0);
    }

    function transferirFondosPropuesta(address _destinatario, uint256 _monto) external {
    // Verificar que quien llama es un contrato de votación válido
    bool esVotacionValida = false;
    for (uint256 i = 0; i < contadorPropuestas; i++) {
        if (propuestasVotacion[i] == msg.sender) {
            esVotacionValida = true;
            break;
        }
    }
    require(esVotacionValida, "Solo contratos de votacion validos");
    
    // Transferir fondos desde tesorería
    (bool success, ) = infoCooperadora.tesoreria.call(
        abi.encodeWithSignature("transferir(address,uint256)", _destinatario, _monto)
    );
    require(success, "Transferencia fallida");
}

