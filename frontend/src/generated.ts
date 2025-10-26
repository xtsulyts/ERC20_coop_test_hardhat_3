import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CooperadoraTest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cooperadoraTestAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Events
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20EventsAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__
 */
export const useReadCooperadoraTest = /*#__PURE__*/ createUseReadContract({
  abi: cooperadoraTestAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadCooperadoraTestAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: cooperadoraTestAbi,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadCooperadoraTestBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: cooperadoraTestAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadCooperadoraTestDecimals =
  /*#__PURE__*/ createUseReadContract({
    abi: cooperadoraTestAbi,
    functionName: 'decimals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"name"`
 */
export const useReadCooperadoraTestName = /*#__PURE__*/ createUseReadContract({
  abi: cooperadoraTestAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCooperadoraTestOwner = /*#__PURE__*/ createUseReadContract({
  abi: cooperadoraTestAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadCooperadoraTestSymbol = /*#__PURE__*/ createUseReadContract(
  { abi: cooperadoraTestAbi, functionName: 'symbol' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadCooperadoraTestTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: cooperadoraTestAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__
 */
export const useWriteCooperadoraTest = /*#__PURE__*/ createUseWriteContract({
  abi: cooperadoraTestAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteCooperadoraTestApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: cooperadoraTestAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteCooperadoraTestBurn = /*#__PURE__*/ createUseWriteContract(
  { abi: cooperadoraTestAbi, functionName: 'burn' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteCooperadoraTestMint = /*#__PURE__*/ createUseWriteContract(
  { abi: cooperadoraTestAbi, functionName: 'mint' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteCooperadoraTestRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cooperadoraTestAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteCooperadoraTestTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: cooperadoraTestAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteCooperadoraTestTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: cooperadoraTestAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCooperadoraTestTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cooperadoraTestAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__
 */
export const useSimulateCooperadoraTest =
  /*#__PURE__*/ createUseSimulateContract({ abi: cooperadoraTestAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateCooperadoraTestApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cooperadoraTestAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateCooperadoraTestBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cooperadoraTestAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateCooperadoraTestMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cooperadoraTestAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateCooperadoraTestRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cooperadoraTestAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateCooperadoraTestTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cooperadoraTestAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateCooperadoraTestTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cooperadoraTestAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCooperadoraTestTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cooperadoraTestAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cooperadoraTestAbi}__
 */
export const useWatchCooperadoraTestEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: cooperadoraTestAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchCooperadoraTestApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cooperadoraTestAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCooperadoraTestOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cooperadoraTestAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cooperadoraTestAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchCooperadoraTestTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cooperadoraTestAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20EventsAbi}__
 */
export const useWatchIerc20EventsEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: ierc20EventsAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ierc20EventsAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchIerc20EventsTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ierc20EventsAbi,
    eventName: 'Transfer',
  })
