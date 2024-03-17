import Web3 from 'web3'
import fetch from 'node-fetch'
import abi from '../abi/WBGL.json'
import { IBridgeConfig } from '../types'
import { ChaindIds } from '../chains'

// Port everything over as in the webapp
// Test with given BGL :)
export class WBGL {
  /**
   * @member web3 instance to use.
   */
  private readonly web3: Web3
  /**
   * @member chainId The chainId of the network to use
   */
  private readonly chainId: number | string | ChaindIds
  private readonly chainName: string
  private readonly bridgeEndpoint = 'https://bglswap.com/app/'

  constructor(config: IBridgeConfig) {
    this.web3 = new Web3(config.provider)
    this.chainId = config.chainId
    this.chainName = config.chainName
  }

  /**
   * @param bglAddress Bitgesell address to receive BGL
   * @param from
   * swapWBGLforBGL swaps WBGL for BGL to recepient Bitgesell address
   */
  public async swapWBGLforBGL(bglAddress: string, to: string, amount: number) {
    try {
      const addressess = await this.web3.eth.getAccounts()
      const ethAddress = addressess[0]
      const signature = await this._signMessage(ethAddress, bglAddress)

      const headers = {
        'Content-Type': 'application/json',
      }

      const dataObject = {
        chainId: this.chainId,
        chain: this.chainName,
        bglAddress,
        ethAddress: ethAddress,
        signature,
      }

      const res = await Promise.all([
        fetch(`${this.bridgeEndpoint}submit/wbgl`, {
          headers,
          body: JSON.stringify(dataObject),
          method: 'POST'
        }),
        this.sendWbgl(to, amount),
      ])

      return res
    } catch (error) {
      throw new Error('Failed' + error)
    }
  }

  private async _signMessage(account: string, message: string) {
    return await this.web3.eth.sign(message, account)
  }

  public async sendWbgl(to: string, amount: number) {
    // should be to Token units not wei
    const value = this.web3.utils.toWei(amount, 'ether')
    const tokenAddress = '0x2ba64efb7a4ec8983e22a49c81fa216ac33f383a'

    const WBGContractInstance = new this.web3.eth.Contract(abi, tokenAddress)
    // copy the way it is in the bridge implementation
    const tx = await WBGContractInstance.methods.transfer(to, value).send()
    return tx
  }
}
