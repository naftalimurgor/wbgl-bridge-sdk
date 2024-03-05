import * as matchers from 'jest-extended'

import { WBGLBridgeSDK } from '../bridge'
import { IBridgeConfig } from '../types'

import { BGL } from '../bridge/BGL'
import { ChainNames, ChaindIds } from '../chains'
import createOptimismProvider from './utils/createOptimismProvider'
import { WBGL } from '../bridge/WBGL'


expect.extend(matchers)

describe('WBGLBridgeSDK base class tests on Ethereum', () => {
  let wBGLBridgeSDK: WBGLBridgeSDK
  let web3Provider = null

  beforeAll(() => {
    const optimimisRPC = process.env.providerUrl
    const MNEMONIC = process.env.MNEMONIC
    const signingAuthority = { mnemonic: MNEMONIC }

    web3Provider = createOptimismProvider(signingAuthority, optimimisRPC)

    const config: IBridgeConfig = {
      provider: web3Provider,
      chainName: ChainNames.Ethereum,
      chainId: ChaindIds.Ethereum,
      bridgeEndpoint: 'https://bglswap.com/app/'
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

    // NB: Both WBGL contracts are deployed to same adress on the same network, unless this changes
    expect(bsc).toEqual(eth)
  })

})
