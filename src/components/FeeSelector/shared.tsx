import { Trans } from '@lingui/macro'
import { ChainId, SUPPORTED_CHAINS } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { MAICHAIN_CHAIN_ID } from 'constants/maichain'
import type { ReactNode } from 'react'

const FEE_SUPPORTED_CHAINS = [...SUPPORTED_CHAINS, MAICHAIN_CHAIN_ID as ChainId] as const

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  { label: string; description: ReactNode; supportedChains: readonly ChainId[] }
> = {
  [FeeAmount.LOWEST]: {
    label: '0.01',
    description: <Trans>Best for very stable pairs.</Trans>,
    supportedChains: [
      ChainId.ARBITRUM_ONE,
      ChainId.BNB,
      ChainId.CELO,
      ChainId.CELO_ALFAJORES,
      ChainId.MAINNET,
      ChainId.OPTIMISM,
      ChainId.POLYGON,
      ChainId.POLYGON_MUMBAI,
      ChainId.AVALANCHE,
      ChainId.BASE,
      MAICHAIN_CHAIN_ID as ChainId,
    ],
  },
  [FeeAmount.LOW]: {
    label: '0.05',
    description: <Trans>Best for stable pairs.</Trans>,
    supportedChains: FEE_SUPPORTED_CHAINS,
  },
  [FeeAmount.MEDIUM]: {
    label: '0.3',
    description: <Trans>Best for most pairs.</Trans>,
    supportedChains: FEE_SUPPORTED_CHAINS,
  },
  [FeeAmount.HIGH]: {
    label: '1',
    description: <Trans>Best for exotic pairs.</Trans>,
    supportedChains: FEE_SUPPORTED_CHAINS,
  },
}
