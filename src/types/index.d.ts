declare module 'wbgl-bridge-sdk';
import { ethers } from 'ethers'

import { ChainNames, ChaindIds } from '../chains'

export interface IBridgeConfig {
  providerUrl?: string
  provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider
  chainName: string | ChainNames
  chainId: number | ChaindIds
  bglPrivateKey: string
  evmPrivateKey: string
  bglSeedPhrase?: string
  bridgeEndpoint?: string
  bglRpcUrl?: string
}
