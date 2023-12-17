import Web3 from 'web3'

interface BridgeConfig {
  providerUrl: string
  provider: Web3['currentProvider']
  chainName: string
  chainId: number
}