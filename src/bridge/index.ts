/* eslint-disable @typescript-eslint/ban-ts-comment */
import fetch from 'node-fetch'
import { BGL } from './BGL'
import { WBGL } from './WBGL'
import { IBridgeConfig } from '../types'

export interface IBridgeHealth {
  status: string;
}

interface IBridgeStatus {
  status: string;
  BGL: IBGLStatus;
  ETH: IETHStatus;
  BSC: IETHStatus;
}

interface IETHStatus {
  chain: string;
  gasPrice: string;
  wbglBalance: string;
  transactionCount: number;
}

interface IBGLStatus {
  blockchainInfo: IBlockchainInfo;
  blockCount: number;
  balance: number;
}

interface IBlockchainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: string;
  mediantime: number;
  verificationprogress: string;
  initialblockdownload: boolean;
  chainwork: string;
  size_on_disk: number;
  pruned: boolean;
  softforks: ISoftforks;
  warnings: string;
}

interface ISoftforks {
  bip34: IBip34;
  bip66: IBip34;
  bip65: IBip34;
  csv: IBip34;
  segwit: IBip34;
  testdummy: ITestdummy;
  taproot: ITaproot;
}

interface ITaproot {
  type: string;
  bip9: IBip9;
  height: number;
  active: boolean;
}

interface ITestdummy {
  type: string;
  bip9: IBip9;
  active: boolean;
}

interface IBip9 {
  status: string;
  start_time: number;
  timeout: number;
  since: number;
  min_activation_height: number;
}

interface IBip34 {
  type: string;
  active: boolean;
  height: number;
}

/**
 * This is an object returned from the bridge with contract address for BGL on 
 * Ethereum mainnet and BSC Mainnet.
 * @param eth: WBGL contract address on Ethereum Mainnet
 * @param bsc: WBGL contract address on Binance Smart Chain Mainnet
 */

export interface IContracts {
  eth: string;
  bsc: string;
}

/**
 * Interract with the WBGL<->BGL bridge by creating and instance of this class
 */
export class WBGLBridgeSDK {
  private bridgeEndpoint: string
  public readonly bgl: BGL
  public readonly wbgl: WBGL

  constructor(config: IBridgeConfig) {
    this.bgl = new BGL(config)
    this.wbgl = new WBGL(config)
    this.bridgeEndpoint = config.bridgeEndpoint || 'https://bglswap.com/app/'
  }

  /**
   * @deprecated Do not use.
   * getBrigeHealth gets the current health of the Bridge
   */
  public async getBridgeHealth(): Promise<IBridgeHealth | null> {
    try {
      const res = await fetch(this.bridgeEndpoint)
      const data = await res.json()
      return data as IBridgeHealth
    } catch (error) {
      return error
    }
  }

  /**
   * @deprecated Do not use.
   * getBridgeStatus returns the current status of the bridge.
   */
  public async getBridgeStatus(): Promise<IBridgeStatus | null> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}status`)
      const data = await res.json()
      return data as IBridgeStatus
    } catch (error) {
      return error
    }
  }

  /**
   * getBalanceBGL fetches bridge balance in BGL, normalized to units
   * 1BGL = 1^18 units 
   * Read more @link https://etherscan.io/token/0x2ba64efb7a4ec8983e22a49c81fa216ac33f383a
   */
  public async getBalanceBGL(): Promise<number> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}balance/bgl`)
      const data = await res.json()
      return data as number
    } catch (error) {
      return error
    }
  }

  public async getBalanceEthereum(): Promise<number> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}balance/eth`)
      const data = await res.json()
      return data as number
    } catch (error) {
      return error
    }
  }

  public async getBalanceBNBChain(): Promise<number> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}balance/bnb`)
      const data = await res.json()
      return data as number
    } catch (error) {
      return error
    }
  }

  public async getBalanceArbitrumChain(): Promise<number> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}balance/arb`)
      const data = await res.json()
      return data as number
    } catch (error) {
      return error
    }
  }

  public async getBalanceOptimismChain(): Promise<number> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}balance/op`)
      const data = await res.json()
      return data as number
    } catch (error) {
      return error
    }
  }


  /**
   * @deprecated
   * getContracts Returns the WBGL contract addresses on BSC, Ethereum blockchains
   */
  public async getContracts(): Promise<IContracts> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}/contracts`)
      const contracts = await res.json()
      return contracts as IContracts
    } catch (error) {
      return error
    }
  }
}

export {
  BGL,
  WBGL,
  IBridgeConfig,
}