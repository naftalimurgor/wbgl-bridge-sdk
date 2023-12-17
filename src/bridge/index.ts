import axios from 'axios'
import { BGL } from './BGL'
import { WBGL } from './WBGL';
import { BridgeConfig } from '../types';

interface BridgeHealth {
  status: string
}

interface BridgeStatus {
  status: string;
  BGL: BGLStatus;
  ETH: ETHStatus;
  BSC: ETHStatus;
}

interface ETHStatus {
  chain: string;
  gasPrice: string;
  wbglBalance: string;
  transactionCount: number;
}

interface BGLStatus {
  blockchainInfo: BlockchainInfo;
  blockCount: number;
  balance: number;
}

interface BlockchainInfo {
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
  softforks: Softforks;
  warnings: string;
}

interface Softforks {
  bip34: Bip34;
  bip66: Bip34;
  bip65: Bip34;
  csv: Bip34;
  segwit: Bip34;
  testdummy: Testdummy;
  taproot: Taproot;
}

interface Taproot {
  type: string;
  bip9: Bip9;
  height: number;
  active: boolean;
}

interface Testdummy {
  type: string;
  bip9: Bip9;
  active: boolean;
}

interface Bip9 {
  status: string;
  start_time: number;
  timeout: number;
  since: number;
  min_activation_height: number;
}

interface Bip34 {
  type: string;
  active: boolean;
  height: number;
}



/**
 * Interract with the WBGL<->BGL bridge by creating and instance of this class
 */
export class WBGLBridgeSDK {
  private readonly bridgeEndpoint = 'https://bglswap.com/app/'
  // @ts-ignore
  private readonly bgl: BGL

  // @ts-ignore
  private readonly wbgl: WBGL

  constructor(config: BridgeConfig) {
    this.bgl = new BGL(config)
    this.wbgl = new WBGL(config)
  }

  /**
   * getBrigeHealth gets the current health of the Bridge
   */
  public async getBridgeHealth(): Promise<BridgeHealth | null> {
    try {
      const { data } = await axios.get(this.bridgeEndpoint)
      return data as BridgeHealth
    } catch (error) {
      return error
    }
  }

  /**
   * getBridgeStatus returns the status of the bridge.
   */
  public async getBridgeStatus(): Promise<BridgeStatus | null> {
    try {
      const { data } = await axios.get(`${this.bridgeEndpoint}status`)
      return data as BridgeStatus
    } catch (error) {
      return error
    }
  }

  /**
   * getBalanceBGL fetches bridge balance in BGL
   */
  public async getBalanceBGL(): Promise<number> {
    try {
      const { data } = await axios.get(`${this.bridgeEndpoint}balance/bgl`)
      return data as number
    } catch (error) {
      return error
    }
  }

  public async getBalanceETH(): Promise<number> {
    try {
      const { data } = await axios.get(`${this.bridgeEndpoint}balance/eth`)
      return data as number
    } catch (error) {
      return error
    }
  } public async getBalanceBSC(): Promise<number> {
    try {
      const { data } = await axios.get(`${this.bridgeEndpoint}balance/bsc`)
      return data as number
    } catch (error) {
      return error
    }
  }

}