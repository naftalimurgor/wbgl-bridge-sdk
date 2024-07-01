import * as matchers from 'jest-extended'

import { IBridgeConfig } from '../types'

import {
  BGL,
  BGLWBGLExchangePair,
  ChainNames,
  ChaindIds
} from '../'

import {
  ethers,
  Wallet
} from 'ethers'


expect.extend(matchers)
const TIME_OUT_MS = 10 * 1000

jest.setTimeout(TIME_OUT_MS)

describe('BGL class tests on BNB Chain', () => {

  let BGLInstance: BGL
  // let provider
  let signer: ethers.Wallet
  let recepientBNBAddress: string

  beforeAll(async () => {
    const bscProviderRpc = 'https://rpc.ankr.com/bsc'
    // const MNEMONIC = process.env.MNEMONIC as string
    // const bglSeedPhrase = process.env.BGL_SEEDPHRASE
    const bglPrivateKey = process.env.BGL_PRIVATEKEY_OR_SEED

    const provider = new ethers.providers.JsonRpcProvider(bscProviderRpc)
    // const provider = new ethers.providers.Web3Provider(window.etherum)

    const config: IBridgeConfig = {
      evmPrivateKey: process.env.EVM_PRIVATE_KEY as string,
      provider: provider,
      chainName: ChainNames.BNBSmartChain,
      chainId: ChaindIds.BNBSmartChain,
      bridgeEndpoint: 'https://bglswap.com/app/',
      // bglSeedPhrase: bglSeedPhrase
      bglPrivateKeyOrSeed: bglPrivateKey as string
    }

    BGLInstance = new BGL(config)
    signer = new Wallet(config.evmPrivateKey, provider)
    recepientBNBAddress = await signer.getAddress()
    console.log('account:', recepientBNBAddress)
  })

  it('test that BGL class instantiates correctly', () => {
    expect(BGLInstance).toBeInstanceOf(BGL)
  })

  it('should swap BGL for WBGL Tokens', async () => {
    const blgAmountToSwap = 1 // 1BGL
    const bglTxFee = 0.0001 // minimum txFee of proposed 10,000 satoshis(0.0001BGL)

    const bGLWBGLExchangePair: BGLWBGLExchangePair = {
      recepientWBGLAddress: recepientBNBAddress,
      bglAmount: blgAmountToSwap,
      bglFee: bglTxFee
    }

    const swapResult = await BGLInstance.swapBGLforWBGL(bGLWBGLExchangePair)
    // console.log(swapResult)
    expect(swapResult.bglTxHash).toBeDefined()
    expect(swapResult.rpcResult.error).toBe(null)
  }, 15 * 1000)
})
