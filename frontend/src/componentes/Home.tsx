import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`;
import { cooperadoraTestAbi } from '../generated';

export function Home() {
  const { address, isConnected } = useAccount();
  const [transferTo, setTransferTo] = useState('');
  const [amount, setAmount] = useState('');

  const { data: balance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: cooperadoraTestAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { 
    data: hash,
    writeContract,
    isPending 
  } = useWriteContract();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cooperadora DAO
            </h1>
            <p className="text-gray-600 text-sm mt-1">Gestiona tus tokens COOP</p>
          </div>
          <ConnectButton 
            showBalance={false}
            accountStatus="address"
          />
        </div>

        {isConnected ? (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-600 text-sm font-medium">Balance disponible</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {balance ? (Number(balance) / 10**18).toLocaleString() : '0'} 
                    <span className="text-lg text-gray-500 ml-2">COOP</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
              </div>
            </div>

            {/* Transfer Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transferir tokens</h3>
              
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección destino
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad COOP
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    step="0.01"
                    min="0"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || !transferTo || !amount}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Transferir Tokens'
                  )}
                </button>
              </form>

              {/* Transaction Status */}
              {hash && (
                <div className={`mt-4 p-4 rounded-xl border ${
                  isConfirming ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      isConfirming ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {isConfirming ? 'Confirmando transacción...' : '¡Transacción confirmada!'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 font-mono break-all">
                        Hash: {hash}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Estado no conectado */
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Conecta tu wallet
            </h3>
            <p className="text-gray-600 mb-6">
              Conecta tu wallet para comenzar a gestionar tus tokens COOP
            </p>
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}