import { L2_CHAIN_IDS, SupportedL2ChainId } from 'constants/chains'

export function isL2ChainId(chainId: number | undefined): chainId is SupportedL2ChainId {
  return chainId !== undefined && (L2_CHAIN_IDS as readonly number[]).includes(chainId)
}
