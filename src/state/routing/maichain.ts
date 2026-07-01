import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import IUniswapV3PoolStateJSON from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import IQuoterV2JSON from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoterV2.sol/IQuoterV2.json'
import { computePoolAddress, FeeAmount, Pool, Route as V3Route } from '@uniswap/v3-sdk'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/contracts'
import { isMaichain, MAICHAIN_CHAIN_ID, MAICHAIN_DEPLOYMENTS } from 'constants/maichain'
import { ZERO_PERCENT } from 'constants/misc'
import { RPC_PROVIDERS } from 'constants/providers'
import { nativeOnChain } from 'constants/tokens'

import { ClassicTrade, GetQuoteArgs, QuoteMethod, QuoteState, SwapRouterNativeAssets, TradeResult } from './types'

const MAICHAIN_FEE_AMOUNTS = [FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH, FeeAmount.LOWEST]

type MaichainRouteQuote = {
  pool: Pool
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  sortAmount: BigNumber
}

export function isMaichainQuote(args: GetQuoteArgs): boolean {
  return isMaichain(args.tokenInChainId) && isMaichain(args.tokenOutChainId)
}

function isNativeQuoteAddress(address: string): boolean {
  return Object.values(SwapRouterNativeAssets).includes(address as SwapRouterNativeAssets)
}

function parseQuoteCurrency({
  address,
  chainId,
  decimals,
  symbol,
}: {
  address: string
  chainId: number
  decimals: number
  symbol?: string
}): Currency {
  if (isNativeQuoteAddress(address)) return nativeOnChain(chainId)
  return new Token(chainId, address, decimals, symbol)
}

async function getPool(tokenA: Token, tokenB: Token, fee: FeeAmount): Promise<Pool | undefined> {
  const provider = RPC_PROVIDERS[MAICHAIN_CHAIN_ID]
  const factoryAddress = V3_CORE_FACTORY_ADDRESSES[MAICHAIN_CHAIN_ID]
  if (!factoryAddress) return undefined

  const poolAddress = computePoolAddress({ factoryAddress, tokenA, tokenB, fee })
  const poolContract = new Contract(poolAddress, IUniswapV3PoolStateJSON.abi, provider)

  try {
    const [slot0, liquidity] = await Promise.all([poolContract.slot0(), poolContract.liquidity()])
    if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return undefined
    return new Pool(tokenA, tokenB, fee, slot0.sqrtPriceX96.toString(), liquidity.toString(), slot0.tick)
  } catch {
    return undefined
  }
}

async function getRouteQuote(
  args: GetQuoteArgs,
  currencyIn: Currency,
  currencyOut: Currency,
  fee: FeeAmount
): Promise<MaichainRouteQuote | undefined> {
  const provider = RPC_PROVIDERS[MAICHAIN_CHAIN_ID]
  const quoter = new Contract(MAICHAIN_DEPLOYMENTS.QuoterV2, IQuoterV2JSON.abi, provider)
  const tokenIn = currencyIn.wrapped
  const tokenOut = currencyOut.wrapped
  const pool = await getPool(tokenIn, tokenOut, fee)
  if (!pool) return undefined

  const params = {
    tokenIn: tokenIn.address,
    tokenOut: tokenOut.address,
    amount: args.amount,
    amountIn: args.amount,
    fee,
    sqrtPriceLimitX96: 0,
  }

  try {
    if (args.tradeType === TradeType.EXACT_INPUT) {
      const result = await quoter.callStatic.quoteExactInputSingle(params)
      const amountOut = result.amountOut ?? result[0]
      return {
        pool,
        inputAmount: CurrencyAmount.fromRawAmount(currencyIn, args.amount),
        outputAmount: CurrencyAmount.fromRawAmount(currencyOut, amountOut.toString()),
        sortAmount: amountOut,
      }
    }

    const result = await quoter.callStatic.quoteExactOutputSingle(params)
    const amountIn = result.amountIn ?? result[0]
    return {
      pool,
      inputAmount: CurrencyAmount.fromRawAmount(currencyIn, amountIn.toString()),
      outputAmount: CurrencyAmount.fromRawAmount(currencyOut, args.amount),
      sortAmount: amountIn,
    }
  } catch {
    return undefined
  }
}

function selectBestQuote(args: GetQuoteArgs, quotes: MaichainRouteQuote[]): MaichainRouteQuote | undefined {
  if (quotes.length === 0) return undefined

  return quotes.reduce((best, quote) => {
    if (args.tradeType === TradeType.EXACT_INPUT) return quote.sortAmount.gt(best.sortAmount) ? quote : best
    return quote.sortAmount.lt(best.sortAmount) ? quote : best
  })
}

export async function getMaichainQuote(args: GetQuoteArgs, quoteMethod: QuoteMethod): Promise<TradeResult> {
  if (!isMaichainQuote(args)) return { state: QuoteState.NOT_FOUND }

  const currencyIn = parseQuoteCurrency({
    address: args.tokenInAddress,
    chainId: args.tokenInChainId,
    decimals: args.tokenInDecimals,
    symbol: args.tokenInSymbol,
  })
  const currencyOut = parseQuoteCurrency({
    address: args.tokenOutAddress,
    chainId: args.tokenOutChainId,
    decimals: args.tokenOutDecimals,
    symbol: args.tokenOutSymbol,
  })

  const quotes = (
    await Promise.all(MAICHAIN_FEE_AMOUNTS.map((fee) => getRouteQuote(args, currencyIn, currencyOut, fee)))
  ).filter((quote): quote is MaichainRouteQuote => Boolean(quote))
  const bestQuote = selectBestQuote(args, quotes)

  if (!bestQuote) return { state: QuoteState.NOT_FOUND }

  return {
    state: QuoteState.SUCCESS,
    trade: new ClassicTrade({
      v2Routes: [],
      v3Routes: [
        {
          routev3: new V3Route([bestQuote.pool], currencyIn, currencyOut),
          inputAmount: bestQuote.inputAmount,
          outputAmount: bestQuote.outputAmount,
        },
      ],
      mixedRoutes: [],
      tradeType: args.tradeType,
      quoteMethod,
      approveInfo: { needsApprove: false },
      inputTax: ZERO_PERCENT,
      outputTax: ZERO_PERCENT,
    }),
  }
}
