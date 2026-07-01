import { Currency, Token } from '@uniswap/sdk-core'
import { useCachedPortfolioBalancesQuery } from 'components/AccountDrawer/PrefetchBalancesWrapper'
import { CHAIN_ID_TO_BACKEND_NAME, supportedChainIdFromGQLChain } from 'graphql/data/util'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { TokenBalances } from 'lib/hooks/useTokenList/sorting'
import { useMemo } from 'react'

function gqlChainHasPortfolioBalances(chainId?: number): boolean {
  return chainId !== undefined && chainId in CHAIN_ID_TO_BACKEND_NAME
}

function buildBalancesFromOnChain(currencies: Currency[], amounts: ReturnType<typeof useCurrencyBalances>): TokenBalances {
  return currencies.reduce<TokenBalances>((balanceMap, currency, i) => {
    const amount = amounts[i]
    if (!currency || !amount) return balanceMap

    const balance = parseFloat(amount.toExact())
    const key = currency.isNative ? 'ETH' : currency.wrapped.address.toLowerCase()
    // No USD prices on custom chains; use token amount for sorting/filtering.
    balanceMap[key] = { balance, usdValue: balance }
    return balanceMap
  }, {})
}

export function useTokenSearchBalances({
  account,
  chainId,
  tokens,
}: {
  account?: string
  chainId?: number
  tokens: Token[]
}): { balances: TokenBalances; loading: boolean } {
  const useOnChain = !gqlChainHasPortfolioBalances(chainId)
  const native = useNativeCurrency(chainId)
  const wrapped = native.wrapped

  const onChainCurrencies = useMemo(() => {
    if (!useOnChain) return []
    const seen = new Set<string>()
    const currencies: Currency[] = []
    const add = (currency: Currency) => {
      const key = currency.isNative ? 'native' : currency.wrapped.address.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        currencies.push(currency)
      }
    }
    add(native)
    add(wrapped)
    tokens.forEach(add)
    return currencies
  }, [useOnChain, native, wrapped, tokens])

  const onChainAmounts = useCurrencyBalances(useOnChain ? account : undefined, onChainCurrencies)

  const { data, loading: gqlLoading } = useCachedPortfolioBalancesQuery({
    account: useOnChain ? undefined : account,
  })

  const gqlBalances: TokenBalances = useMemo(() => {
    if (useOnChain) return {}
    return (
      data?.portfolios?.[0].tokenBalances?.reduce((balanceMap, tokenBalance) => {
        if (
          tokenBalance.token?.chain &&
          supportedChainIdFromGQLChain(tokenBalance.token?.chain) === chainId &&
          tokenBalance.token?.address !== undefined &&
          tokenBalance.denominatedValue?.value !== undefined
        ) {
          const address = tokenBalance.token?.standard === 'ERC20' ? tokenBalance.token?.address?.toLowerCase() : 'ETH'
          const usdValue = tokenBalance.denominatedValue?.value
          const balance = tokenBalance.quantity
          balanceMap[address] = { usdValue, balance: balance ?? 0 }
        }
        return balanceMap
      }, {} as TokenBalances) ?? {}
    )
  }, [chainId, data?.portfolios, useOnChain])

  const onChainBalances = useMemo(
    () => (useOnChain ? buildBalancesFromOnChain(onChainCurrencies, onChainAmounts) : {}),
    [useOnChain, onChainCurrencies, onChainAmounts]
  )

  return {
    balances: useOnChain ? onChainBalances : gqlBalances,
    loading: useOnChain ? false : gqlLoading,
  }
}
