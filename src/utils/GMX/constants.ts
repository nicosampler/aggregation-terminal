import { expandDecimals } from '@/src/utils/GMX/numbers'

export const BASIS_POINTS_DIVISOR = 10000
export const MARGIN_FEE_BASIS_POINTS = 10
export const DEFAULT_MAX_USDG_AMOUNT = expandDecimals(200 * 1000 * 1000, 18)
export const MAX_PRICE_DEVIATION_BASIS_POINTS = 750
export const PRECISION = expandDecimals(1, 30)
export const USDG_DECIMALS = 18
export const SWAP_FEE_BASIS_POINTS = 30
export const TAX_BASIS_POINTS = 50
