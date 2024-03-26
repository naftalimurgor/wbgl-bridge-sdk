import * as matchers from 'jest-extended'

import { IBridgeConfig } from '../types'

import Web3 from 'web3'

import HDWalletProvider from '@truffle/hdwallet-provider'

import {
  BGL,
  BGLWBGLExchangePair,
  ChainNames,
  ChaindIds
} from '../'


expect.extend(matchers)
const TIME_OUT_MS = 10 * 1000

jest.setTimeout(TIME_OUT_MS)

describe('BGL class tests on Binance Smart Chain', () => {

  let bGL: BGL
  let web3Provider = null
  let web3Instance: Web3
  let recepientBSCAddress: string

  beforeAll(async () => {
    const bscProviderRpc = 'https://rpc.ankr.com/bsc'
    const MNEMONIC = process.env.MNEMONIC
    const bglSeedPhrase = process.env.bglSeedphrase

    web3Provider = new HDWalletProvider(MNEMONIC, bscProviderRpc)

    const config: IBridgeConfig = {
      provider: web3Provider,
      chainName: ChainNames.BinanceSmartChain,
      chainId: ChaindIds.BinanceSmartChain,
      bridgeEndpoint: 'https://bglswap.com/app/',
      bglPrivateKey: process.env.bglPrivateKey,
      bglSeedPhrase: bglSeedPhrase
    }

    bGL = new BGL(config)
    web3Instance = new Web3(web3Provider)
    const accounts = await web3Instance.eth.getAccounts()
    recepientBSCAddress = accounts[0] // address 0

  })

  it('test that BGL class instantiates correctly', () => {
    expect(bGL).toBeInstanceOf(BGL)
  })

  it('should swap BGL for WBGL Tokens', async () => {
    const blgAmountToSwap = 1 // 1BGL
    const bglTxFee = 0.0001 // minimum txFee of proposed 10,000 satoshis(0.0001BGL)

    const bGLWBGLExchangePair: BGLWBGLExchangePair = {
      sourceWBGLAddress: recepientBSCAddress,
      bglAmount: blgAmountToSwap,
      bglFee: bglTxFee
    }

    const swapResult = await bGL.swapBGLforWBGL(bGLWBGLExchangePair)
    // console.log(swapResult)
    expect(swapResult.bglTxHash).toBeDefined()
    expect(swapResult.rpcResult.error).toBe(null)
  }, 15 * 1000)
})
