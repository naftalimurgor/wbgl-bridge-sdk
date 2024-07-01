import * as matchers from 'jest-extended'

import { IBridgeHealth, WBGLBridgeSDK } from '../bridge'
import { IBridgeConfig } from '../types'

import {
  BGL,
  ChainNames,
  ChaindIds,
  WBGL
} from '../'
import { ethers } from 'ethers'


expect.extend(matchers)

describe('WBGLBridgeSDK base class tests on Ethereum', () => {
  let wBGLBridgeSDK: WBGLBridgeSDK
  let provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider

  beforeAll(() => {
    const bscNodeRPC = 'https://rpc.ankr.com/bsc'
    // const MNEMONIC = process.env.MNEMONIC

    provider = new ethers.providers.JsonRpcProvider(bscNodeRPC)

    const config: IBridgeConfig = {
      evmPrivateKey: process.env.EVM_PRIVATEKEY as string, // Arbitrum, BNB chain, Ethereum privateKey etc
      provider: provider,
      chainName: ChainNames.Ethereum,
      chainId: ChaindIds.Ethereum,
      bridgeEndpoint: 'https://bglswap.com/app/',
      bglPrivateKeyOrSeed: process.env.BGL_PRIVATEKEY_OR_SEED as string
    }

    wBGLBridgeSDK = new WBGLBridgeSDK(config)
  })


  it.only('should initiate WBGLBridgeSDK and internal classes correctly', () => {
    expect(wBGLBridgeSDK.bgl).toBeInstanceOf(BGL)
    expect(wBGLBridgeSDK.wbgl).toBeInstanceOf(WBGL)
  })

  it('should get Bridge Health status', async () => {
    const bridgeHealth = await wBGLBridgeSDK.getBridgeHealth() as IBridgeHealth

    const { status } = bridgeHealth
    expect(status).not.toBe(null)
  })

  it.only('should getBalanceBGL in BGL of the Bridge', async () => {
    const balanceBGL = await wBGLBridgeSDK.getBalanceBGL()
    expect(balanceBGL).toBeDefined()
    expect(balanceBGL).toBeNumber()
  })

  it.only('should token balance in WBGL  on BNBChain', async () => {
    const wbglBalance = await wBGLBridgeSDK.getBalanceBNBChain()
    expect(wbglBalance).toBeDefined()
    expect(wbglBalance).toBeNumber()
  })

  it.only('should getBalanceBGL in WBGL on Ethereum network', async () => {
    const wbglBalance = await wBGLBridgeSDK.getBalanceEthereum()
    expect(wbglBalance).toBeDefined()
    expect(wbglBalance).toBeNumber()
  })

  it.only('should getBalanceBGL in WBGL on Optimism network', async () => {
    const wbglBalance = await wBGLBridgeSDK.getBalanceOptimismChain()
    expect(wbglBalance).toBeDefined()
    expect(wbglBalance).toBeNumber()
  })

  it.only('should getBalanceBGL in WBGL on Ethereum network', async () => {
    const wbglBalance = await wBGLBridgeSDK.getBalanceArbitrumChain()
    expect(wbglBalance).toBeDefined()
    expect(wbglBalance).toBeNumber()
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
