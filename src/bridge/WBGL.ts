import Web3 from 'web3'
import { BridgeConfig } from '../types'
import axios from 'axios'

export class WBGL {
  private readonly web3: Web3
  private readonly chainId: number | string
  private readonly chainName: string
  private readonly bridgeEndpoint = 'https://bglswap.com/app/'

  constructor(config: BridgeConfig) {
    this.web3 = new Web3(config.provider)
    this.chainId = config.chainId
    this.chainName = config.chainName
  }

  /**
   * swapWBGLforBGL swaps WBGL for BGL to recepient address
   */
  public async swapWBGLforBGL(bglAddress: string, from: string, to: string, amount: string) {
    try {
      const addressess = await this.web3.eth.getAccounts()
      const ethAddress = addressess[0]
      const signature = await this.signMessage(ethAddress, bglAddress)

      const headers = {
        "Content-Type": "application/json"
      }

      const dataObj = {
        chainId: this.chainId,
        chainName: this.chainName,
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


  public async sendWbgl(from: string, to: string, amount: number) {
    const value = this.web3.utils.toWei(amount, 'ether');
    const abi = ''
    const tokenAddress = '0x2ba64efb7a4ec8983e22a49c81fa216ac33f383a'

    const WBGContractInstance = new this.web3.eth.Contract(abi, tokenAddress)

    // @ts-ignore
    await WBGContractInstance.methods.transfer(to, value).send({ from })
  }

}