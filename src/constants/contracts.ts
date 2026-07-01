import { ChainId } from '@uniswap/sdk-core'
import {
  MULTICALL_ADDRESSES as SDK_MULTICALL_ADDRESSES,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES as SDK_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  TICK_LENS_ADDRESSES as SDK_TICK_LENS_ADDRESSES,
  V3_CORE_FACTORY_ADDRESSES as SDK_V3_CORE_FACTORY_ADDRESSES,
  V3_MIGRATOR_ADDRESSES as SDK_V3_MIGRATOR_ADDRESSES,
} from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS } from '@uniswap/universal-router-sdk'

import { isMaichain, MAICHAIN_CHAIN_ID, MAICHAIN_DEPLOYMENTS } from './maichain'

type AddressMap = { [chainId: number]: string | undefined }

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  ...SDK_V3_CORE_FACTORY_ADDRESSES,
  [MAICHAIN_CHAIN_ID]: MAICHAIN_DEPLOYMENTS.UniswapV3Factory,
}

export const MULTICALL_ADDRESSES: AddressMap = {
  ...SDK_MULTICALL_ADDRESSES,
  [MAICHAIN_CHAIN_ID]: MAICHAIN_DEPLOYMENTS.UniswapInterfaceMulticall,
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  ...SDK_NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  [MAICHAIN_CHAIN_ID]: MAICHAIN_DEPLOYMENTS.NonfungiblePositionManager,
}

export const TICK_LENS_ADDRESSES: AddressMap = {
  ...SDK_TICK_LENS_ADDRESSES,
  [MAICHAIN_CHAIN_ID]: MAICHAIN_DEPLOYMENTS.TickLens,
}

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  ...SDK_V3_MIGRATOR_ADDRESSES,
  [MAICHAIN_CHAIN_ID]: MAICHAIN_DEPLOYMENTS.V3Migrator,
}

export function getSwapRouterAddress(chainId: number | null | undefined): string | undefined {
  if (!chainId) return undefined
  if (isMaichain(chainId)) return MAICHAIN_DEPLOYMENTS.SwapRouter

  try {
    return UNIVERSAL_ROUTER_ADDRESS(chainId as ChainId)
  } catch {
    return undefined
  }
}
