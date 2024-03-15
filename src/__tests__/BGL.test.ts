import * as matchers from 'jest-extended'

import { IBridgeConfig } from '../types'

import Web3 from 'web3'
import sb from 'satoshi-bitcoin'

import { BGL } from '../bridge/BGL'
import { ChainNames, ChaindIds } from '../chains'
import HDWalletProvider from '@truffle/hdwallet-provider'


expect.extend(matchers)

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

  it('should swap BGL for WBGL', async () => {
    const blgAmountToSwap = sb.toSatoshi(5) // 5BGL
    const bglTxFee = sb.toSatoshi(0.00010000)  // fee to cover Bitgesell transaction
    const bglTotalAmountSpent = blgAmountToSwap + bglTxFee
    console.log(bglTotalAmountSpent)

    // this this the address to receive WBGL to:
    console.log(recepientBSCAddress)

    const swapResult = await bGL.swapBGLforWBGL(recepientBSCAddress, bglTotalAmountSpent)
    console.log(swapResult)
    expect(swapResult).toBeDefined()
  })

})
