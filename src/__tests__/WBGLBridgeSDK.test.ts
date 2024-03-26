import * as matchers from 'jest-extended'

import { WBGLBridgeSDK } from '../bridge'
import { IBridgeConfig } from '../types'

import {
  BGL,
  ChainNames,
  ChaindIds,
  WBGL
} from '../'

import HDWalletProvider from '@truffle/hdwallet-provider'


expect.extend(matchers)

describe('WBGLBridgeSDK base class tests on Ethereum', () => {
  let wBGLBridgeSDK: WBGLBridgeSDK
  let web3Provider = null

  beforeAll(() => {
    const bscNodeRPC = 'https://rpc.ankr.com/bsc'
    const MNEMONIC = process.env.MNEMONIC

    web3Provider = new HDWalletProvider(MNEMONIC, bscNodeRPC)

    const config: IBridgeConfig = {
      provider: web3Provider,
      chainName: ChainNames.Ethereum,
      chainId: ChaindIds.Ethereum,
      bridgeEndpoint: 'https://bglswap.com/app/',
      bglPrivateKey: ''
    }

    wBGLBridgeSDK = new WBGLBridgeSDK(config)
  })

  afterAll(() => {
    web3Provider.engine.stop()
  })

  it('should initiate WBGLBridgeSDK and internal classes correctly', () => {
    expect(wBGLBridgeSDK.bgl).toBeInstanceOf(BGL)
    expect(wBGLBridgeSDK.wbgl).toBeInstanceOf(WBGL)
  })

  it('should get Bridge Health status', async () => {
    const bridgeHealth = await wBGLBridgeSDK.getBridgeHealth()
    const { status } = bridgeHealth
    expect(status).toBe('ok')
  })

  it('should getBalanceBGL in BGL of the Bridge', async () => {
    const balanceBGL = await wBGLBridgeSDK.getBalanceBGL()
    expect(balanceBGL).toBeDefined()
    expect(balanceBGL).toBeNumber()
  })

  it('should getContracts address of WBGL contract on BSC and Ethereum Mainnet', async () => {
    const contracts = await wBGLBridgeSDK.getContracts()

    const {
      bsc,
      eth
    } = contracts

    expect(bsc).toBe('0x2ba64efb7a4ec8983e22a49c81fa216ac33f383a')
    expect(eth).toBe('0x2ba64efb7a4ec8983e22a49c81fa216ac33f383a')

    // NB: Both WBGL contracts are deployed to same address on the bsc + ethereum, unless this changes in future
    expect(bsc).toEqual(eth)
  })

})
