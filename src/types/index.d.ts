declare module 'wbgl-bridge-sdk';

import Web3 from 'web3'
import { ChainNames, ChaindIds } from '../chains'

export interface IBridgeConfig {
  providerUrl?: string
  // @todo: use more generic type for provider: More on Providers: https://docs.web3js.org/guides/web3_providers_guide/#providers-types
  provider: Web3['currentProvider'] | unknown
  chainName: string | ChainNames
  chainId: number | ChaindIds
  bglPrivateKey: string
  bglSeedPhrase?: string
  bridgeEndpoint?: string
  blgRpcNode?: string
}
