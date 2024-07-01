import { ethers } from 'ethers'
import * as matchers from 'jest-extended'

import WBGLBridgeSDK, {
  ChaindIds,
  ChainNames,
  IBridgeConfig,
  WBGL
} from '../'
import { WBGLBGLExchangePair } from '../bridge/WBGL'

expect.extend(matchers)

console.log(process.env.evmPrivateKey)
describe('WBGL class tests on Ethereum', () => {

  let WBGLSDKInstance: WBGLBridgeSDK
  let provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider
  // const recepientWBGLAddress = ''
  const bglAddress = 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'
  let bnbAddress: string

  beforeAll(async () => {
    const bscProvider = 'https://rpc.ankr.com/bsc'
    // const MNEMONIC = process.env.MNEMONIC 

    provider = new ethers.providers.JsonRpcProvider(bscProvider)

    const config: IBridgeConfig = {
      evmPrivateKey: process.env.EVM_PRIVATE_KEY as string,
      provider: provider,
      chainName: ChainNames.BNBSmartChain,
      chainId: ChaindIds.BNBSmartChain,
      bridgeEndpoint: 'https://bglswap.com/app/',
      bglPrivateKeyOrSeed: process.env.BGL_PRIVATEKEY_OR_SEED as string
    }

    WBGLSDKInstance = new WBGLBridgeSDK(config)
    const signer = new ethers.Wallet(config.evmPrivateKey, provider)
    bnbAddress = await signer.getAddress()
  })


  it('test that WBGL instantiates correctly', () => {
    expect(WBGLSDKInstance).toBeInstanceOf(WBGLBridgeSDK)
    expect(WBGLSDKInstance.wbgl).toBeInstanceOf(WBGL)
  })

  it('should swap WBGL tokens for BGL via the Bridge', async () => {
    // NOTE: this requires some ether/bnb to cover gas fees for WBGL token transfer
    const wbglPair: WBGLBGLExchangePair = {
      bglAddress: bglAddress,
      to: bnbAddress,
      wbglAmount: 5
    }
    const tx = await WBGLSDKInstance.wbgl.swapWBGLforBGL(wbglPair)
    console.log(tx)
    expect(tx.transactionHash).toBeDefined()
  })

})
