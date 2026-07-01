export const MAICHAIN_CHAIN_ID = 9527 as const

export const MAICHAIN_RPC_URL = process.env.REACT_APP_MAICHAIN_RPC_URL || 'https://testnet-node-0.maichain.org'
export const MAICHAIN_EXPLORER_URL = 'https://testnet.maiscan.org/'

export const MAICHAIN_DEPLOYMENTS = {
  WETH9: '0x394133e6574249A608E6dF236671Fec25B7485F1',
  USDT: '0xfE855508631458FBA63dEf998Cc310a5e4A3A445',
  UniswapV3Factory: '0xEE33AA45fA9642408e21Fc1E3c45daB38D614158',
  SwapRouter: '0x9cE47d6188955D7dfdeB6238f3eBef3Be8a196Cf',
  NFTDescriptor: '0x772C53bbA1a1E531CC21E43897Ce90fa7602dE31',
  NonfungibleTokenPositionDescriptor: '0xF411e170c1fa799D564E3Db9E2A000Ef685e67D7',
  NonfungiblePositionManager: '0x92FBfcb8548cEA55bD5bf95F9f2197A00c848e8F',
  Quoter: '0x71D765fc6D28Fb8Ae6C3b85421f2f21Fe460bC79',
  QuoterV2: '0x5Bf7b942C11E990c55f7515639F864002d186D2C',
  TickLens: '0x45b8e9aF3511a8e02a744951AdB29431cdcfd199',
  UniswapInterfaceMulticall: '0xe74D01294aE6602BF2c032a75a2A464d0E2837ED',
  V3Migrator: '0x8844C658FB88a0530195E20687281072DEa81C1f',
} as const

export function isMaichain(chainId: number | null | undefined): chainId is typeof MAICHAIN_CHAIN_ID {
  return chainId === MAICHAIN_CHAIN_ID
}
