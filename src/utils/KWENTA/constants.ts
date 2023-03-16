import { BigNumber } from 'ethers'
import { formatBytes32String } from 'ethers/lib/utils.js'

export const ADDITIONAL_SYNTHS = [
  'SNX',
  'ETH',
  'BTC',
  'LINK',
  'SOL',
  'AVAX',
  'MATIC',
  'EUR',
  'AAVE',
  'UNI',
  'XAU',
  'XAG',
  'APE',
  'DYDX',
  'BNB',
  'XMR',
  'DOGE',
  'OP',
  'ATOM',
  'FLOW',
  'FTM',
  'NEAR',
  'AXS',
  'AUD',
  'GBP',
].map(formatBytes32String)

export enum FuturesMarketKey {
  sBTCPERP = 'sBTCPERP',
  sETHPERP = 'sETHPERP',
  sLINKPERP = 'sLINKPERP',
  sSOLPERP = 'sSOLPERP',
  sAVAXPERP = 'sAVAXPERP',
  sAAVEPERP = 'sAAVEPERP',
  sUNIPERP = 'sUNIPERP',
  sMATICPERP = 'sMATICPERP',
  sXAUPERP = 'sXAUPERP',
  sXAGPERP = 'sXAGPERP',
  sEURPERP = 'sEURPERP',
  sAPEPERP = 'sAPEPERP',
  sDYDXPERP = 'sDYDXPERP',
  sBNBPERP = 'sBNBPERP',
  sDOGEPERP = 'sDOGEPERP',
  sOPPERP = 'sOPPERP',
  sATOMPERP = 'sATOMPERP',
  sFTMPERP = 'sFTMPERP',
  sNEARPERP = 'sNEARPERP',
  sFLOWPERP = 'sFLOWPERP',
  sAXSPERP = 'sAXSPERP',
  sAUDPERP = 'sAUDPERP',
  sGBPPERP = 'sGBPPERP',
}

export enum FuturesMarketAsset {
  sBTC = 'sBTC',
  sETH = 'sETH',
  LINK = 'LINK',
  SOL = 'SOL',
  AVAX = 'AVAX',
  AAVE = 'AAVE',
  UNI = 'UNI',
  MATIC = 'MATIC',
  XAU = 'XAU',
  XAG = 'XAG',
  EUR = 'EUR',
  APE = 'APE',
  DYDX = 'DYDX',
  BNB = 'BNB',
  DOGE = 'DOGE',
  OP = 'OP',
  ATOM = 'ATOM',
  FTM = 'FTM',
  NEAR = 'NEAR',
  FLOW = 'FLOW',
  AXS = 'AXS',
  AUD = 'AUD',
  GBP = 'GBP',
}

export const MarketAssetByKey: Record<FuturesMarketKey, FuturesMarketAsset> = {
  [FuturesMarketKey.sBTCPERP]: FuturesMarketAsset.sBTC,
  [FuturesMarketKey.sETHPERP]: FuturesMarketAsset.sETH,
  [FuturesMarketKey.sLINKPERP]: FuturesMarketAsset.LINK,
  [FuturesMarketKey.sSOLPERP]: FuturesMarketAsset.SOL,
  [FuturesMarketKey.sAVAXPERP]: FuturesMarketAsset.AVAX,
  [FuturesMarketKey.sAAVEPERP]: FuturesMarketAsset.AAVE,
  [FuturesMarketKey.sUNIPERP]: FuturesMarketAsset.UNI,
  [FuturesMarketKey.sMATICPERP]: FuturesMarketAsset.MATIC,
  [FuturesMarketKey.sXAUPERP]: FuturesMarketAsset.XAU,
  [FuturesMarketKey.sXAGPERP]: FuturesMarketAsset.XAG,
  [FuturesMarketKey.sEURPERP]: FuturesMarketAsset.EUR,
  [FuturesMarketKey.sAPEPERP]: FuturesMarketAsset.APE,
  [FuturesMarketKey.sDYDXPERP]: FuturesMarketAsset.DYDX,
  [FuturesMarketKey.sBNBPERP]: FuturesMarketAsset.BNB,
  [FuturesMarketKey.sDOGEPERP]: FuturesMarketAsset.DOGE,
  [FuturesMarketKey.sOPPERP]: FuturesMarketAsset.OP,
  [FuturesMarketKey.sATOMPERP]: FuturesMarketAsset.ATOM,
  [FuturesMarketKey.sFTMPERP]: FuturesMarketAsset.FTM,
  [FuturesMarketKey.sNEARPERP]: FuturesMarketAsset.NEAR,
  [FuturesMarketKey.sFLOWPERP]: FuturesMarketAsset.FLOW,
  [FuturesMarketKey.sAXSPERP]: FuturesMarketAsset.AXS,
  [FuturesMarketKey.sAUDPERP]: FuturesMarketAsset.AUD,
  [FuturesMarketKey.sGBPPERP]: FuturesMarketAsset.GBP,
} as const
