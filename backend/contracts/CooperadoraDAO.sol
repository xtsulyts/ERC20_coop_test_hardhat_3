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
    CooperadoraTest public tokenCuota; // Cambiado a tipo correcto
    mapping(address => Padre) public padres;
    mapping(uint256 => address) public propuestasVotacion;
    uint256 public contadorPropuestas;
    uint256 public constant RETRASO_VOTACION = 1 days;
    uint256 public constant PERIODO_VOTACION = 7 days;

    // Array para almacenar padres activos
    address[] private padresActivos;

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
        
        // Usar token existente
        tokenCuota = CooperadoraTest(_tokenExistente);
    }

    // FUNCION CLAVE: Presidente agrega padres despues de pago fiat
    function agregarPadre(address _padre, uint256 _cantidadTokens) public soloPresidente {
        require(!padres[_padre].estaActivo, "Ya es padre");
        require(_cantidadTokens > 0, "Cantidad debe ser mayor a 0");
        
        padres[_padre].estaActivo = true;
        padresActivos.push(_padre);
        
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

        // Calcular quorum y mayoria segun tipo
        uint256 quorum;
        uint256 mayoriaRequerida;

        if (_tipo == TipoPropuesta.GASTO_MENOR) {
            quorum = (tokenCuota.totalSupply() * 25) / 100; // 25% tokens
            mayoriaRequerida = 51; // 51% a favor
        } else if (_tipo == TipoPropuesta.GASTO_MODERADO) {
            quorum = (tokenCuota.totalSupply() * 40) / 100; // 40% tokens  
            mayoriaRequerida = 60; // 60% a favor
        } else { // GASTO_MAYOR
            quorum = (tokenCuota.totalSupply() * 60) / 100; // 60% tokens
            mayoriaRequerida = 75; // 75% a favor
        }

        uint256 inicioTiempo = block.timestamp + RETRASO_VOTACION;
        uint256 finTiempo = inicioTiempo + PERIODO_VOTACION;

        // Crear nuevo contrato de votacion
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

    // Votar en una propuesta
    function emitirVoto(uint256 _propuestaId, bool _aFavor) external soloPadre {
        address direccionVotacion = propuestasVotacion[_propuestaId];
        require(direccionVotacion != address(0), "Propuesta no existe");
        
        uint256 poderVoto = tokenCuota.balanceOf(msg.sender);
        VotacionPropuesta(direccionVotacion).votar(_aFavor, poderVoto);
    }

    // Obtener poder de voto (incluye delegaciones)
    function obtenerPoderVoto(address _padre) public view returns (uint256) {
        uint256 poderPropio = tokenCuota.balanceOf(_padre);
        
        // Sumar tokens delegados
        for (uint256 i = 0; i < padresActivos.length; i++) {
            address delegador = padresActivos[i];
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
        return padresActivos;
    }

    // Funcion auxiliar temporal (para testing)
    function cambiarPresidente(address _nuevoPresidente) public soloPresidente {
        address antiguoPresidente = presidente;
        presidente = _nuevoPresidente;
        emit PresidenteCambiado(antiguoPresidente, _nuevoPresidente);
    }

    // Funcion helper para obtener padre por indice
    function obtenerPadrePorIndice(uint256 index) internal view returns (address) {
        require(index < padresActivos.length, "Indice fuera de rango");
        return padresActivos[index];
    }

    function transferirFondosPropuesta(address _destinatario, uint256 _monto) external {
        // Verificar que quien llama es un contrato de votacion valido
        bool esVotacionValida = false;
        for (uint256 i = 0; i < contadorPropuestas; i++) {
            if (propuestasVotacion[i] == msg.sender) {
                esVotacionValida = true;
                break;
            }
        }
        require(esVotacionValida, "Solo contratos de votacion validos");
        
        // Transferir fondos desde tesoreria
        (bool success, ) = infoCooperadora.tesoreria.call(
            abi.encodeWithSignature("transfer(address,uint256)", _destinatario, _monto)
        );
        require(success, "Transferencia fallida");
    }
}