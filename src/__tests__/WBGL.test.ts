import * as matchers from 'jest-extended'

import { IBridgeConfig } from '../types'

import { ChainNames, ChaindIds } from '../chains'
import { WBGL } from '../bridge/WBGL'
import HDWalletProvider from '@truffle/hdwallet-provider'


expect.extend(matchers)

describe('WBGL class tests on Ethereum', () => {

  let wBGL: WBGL
  let web3Provider = null
  const recepientWBGLAddress = ''
  const bglAddress = 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'

  beforeAll(() => {
    const bscProvider = 'https://rpc.ankr.com/bsc'
    const MNEMONIC = process.env.MNEMONIC

    web3Provider = new HDWalletProvider(MNEMONIC, bscProvider)

    const config: IBridgeConfig = {
      provider: web3Provider,
      chainName: ChainNames.BinanceSmartChain,
      chainId: ChaindIds.BinanceSmartChain,
      bridgeEndpoint: 'https://bglswap.com/app/',
      bglPrivateKey: process.env.bglPrivateKey
    }

    wBGL = new WBGL(config)
  })

  afterAll(() => {
    web3Provider.engine.stop()
  })

  it('test that WBGL instantiates correctly', () => {
    expect(wBGL).toBeInstanceOf(WBGL)
  })

  it('should swap WBGL tokens for BGL via the Bridge', () => {
    console.log(recepientWBGLAddress)
    console.log(bglAddress)
    // refer to web app implementation
  })

})
