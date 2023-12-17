import Web3 from "web3";
import { BridgeConfig } from "../types";
import axios from "axios";


/**
 * BGL <- WBGL, send BGL and recive BGL,
 */
export class BGL {
  private readonly web3: Web3
  private readonly chainId: number | string
  private readonly bridgeEndpoint = 'https://bglswap.com/app/'

  constructor(config: BridgeConfig) {
    this.web3 = new Web3(config.provider)
  }


  /**
   * swapBGLforWBGL submit eth/bsc address to receive WBGL to 
   *  Send BGL to recieve WBGL tokens to complete the swap
   * @link more https://bglswap.com/
   */
  public async swapBGLforWBGL() {
    const addressess = await this.web3.eth.getAccounts()
    const dataObject = {
      account: addressess[0],
      chainId: this.chainId
    }

    const headers = {
      "Content-Type": "application/json"
    }

    try {
      const { data } = await axios.post(`${this.bridgeEndpoint}submit/bgl`, dataObject, { headers })
      return {
        bglAddress: data.address,
        msg: `Send Bgl to ${data.address} to receive WBGL,  fee is charged`
      }
    } catch (error) {
      return error
    }
  }
}