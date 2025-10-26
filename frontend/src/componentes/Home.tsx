import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// Dirección de tu contrato desplegado en red local
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`;
import { cooperadoraTestAbi } from '../generated';

export function Home() {
  const { address, isConnected } = useAccount();
  const [transferTo, setTransferTo] = useState('');
  const [amount, setAmount] = useState('');

  // Leer balance del token
  const { data: balance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: cooperadoraTestAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Escribir transferencia
  const { 
    data: hash,
    writeContract,
    isPending 
  } = useWriteContract();

  // Esperar confirmación
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !transferTo || !amount) return;

    writeContract({
      address: TOKEN_ADDRESS,
      abi: cooperadoraTestAbi,
      functionName: 'transfer',
      args: [transferTo as `0x${string}`, BigInt(Number(amount) * 10**18)],
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mi Token</h1>
        <ConnectButton />
      </div>

      {isConnected && (
        <div className="space-y-4">
          {/* Balance */}
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Tu Balance:</h3>
            <p>{balance ? Number(balance) / 10**18 : '0'} tokens</p>
          </div>

          {/* Formulario de Transferencia */}
          <form onSubmit={handleTransfer} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Dirección destino (0x...)"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Cantidad"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !transferTo || !amount}
              className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
            >
              {isPending ? 'Enviando...' : 'Transferir'}
            </button>
          </form>

          {/* Estado de Transacción */}
          {hash && (
            <div className="p-3 bg-yellow-100 rounded">
              <p>Transacción enviada: {hash}</p>
              {isConfirming && <p>Esperando confirmación...</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}