import Web3 from 'web3'
import { BridgeConfig } from '../types'
import axios from 'axios'

export class WBGL {
  private readonly web3: Web3
  private readonly chainId: number | string
  private readonly bridgeEndpoint = 'https://bglswap.com/app/'

  constructor(config: BridgeConfig) {
    this.web3 = new Web3(config.provider)
  }

  /**
   * swapWBGLforBGL swaps WBGL for BGL to recepient address
   */
  public async swapWBGLforBGL(bglAddress: string) {
    try {
      const addressess = await this.web3.eth.getAccounts()
      const ethAddress = addressess[0]
      const signature = await this.signMessage(ethAddress, bglAddress)

      const headers = {
        "Content-Type": "application/json"
      }

      const dataObj = {
        bglAddress,
        ethAddress: ethAddress,
        signature
      }

      const { data } = await axios.post(`${this.bridgeEndpoint}submit/wbgl`, dataObj, { headers })
      return data
    } catch (error) {

    }
  }

  private async signMessage(account: string, message: string) {
    return await this.web3.eth.sign(message, account)
  }
}