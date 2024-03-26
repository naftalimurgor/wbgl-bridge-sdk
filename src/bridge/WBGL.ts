import Web3 from 'web3'
import fetch from 'node-fetch'
import abi from '../abi/WBGL.json'
import { IBridgeConfig } from '../types'
import { ChaindIds } from '../chains'
import { IContracts } from '.'

/**
 * @param bglAddress is the address to receive BGL to
 * @param wbglAmount is the amount of WBGL tokens to swap for BGL amount
 */
export interface WBGLBGLExchangePair {
  bglAddress: string
  to: string
  recepientWbglAddress: string
  wbglAmount: number
}

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

  /// START PUBLIC METHODS
  /**
   * @param bglAddress Bitgesell address to receive BGL
   * @param from
   * swapWBGLforBGL swaps WBGL for BGL to recepient Bitgesell address
   */
  public async swapWBGLforBGL({
    bglAddress,
    recepientWbglAddress,
    wbglAmount
  }: WBGLBGLExchangePair) {
    try {
      const addressess = await this.web3.eth.getAccounts()
      const account = recepientWbglAddress || addressess[0]
      const signature = await this._signMessage(account, bglAddress)

      const headers = {
        'Content-Type': 'application/json',
      }

      const dataObject = {
        chainId: this.chainId,
        chain: this.chainName,
        bglAddress,
        ethAddress: account,
        signature,
      }
      const res = await fetch(`${this.bridgeEndpoint}submit/wbgl`, {
        headers,
        body: JSON.stringify(dataObject),
        method: 'POST'
      })
      const bridgeResponse = await res.json()

      const { address: sendAddress } = bridgeResponse

      const txRes = await this._sendWbgl(account, sendAddress, wbglAmount)
      return txRes
    } catch (error) {
      throw new Error('Failed' + error)
    }
  } /// END OF PUBLIC METHODS

  /// START PRIVATE METHODS
  private async _signMessage(account: string, message: string) {
    return await this.web3.eth.sign(message, account)
  }

  public async _sendWbgl(
    from: string,
    to: string,
    amount: number
  ) {
    const value = this.web3.utils.toWei(amount, 'ether')
    const tokenAddress = await this._getWBGLTokenAddress()
    // TODO: perform gas estimate to avoid exhorbitant gas fees
    const WBGContractInstance = new this.web3.eth.Contract(abi, tokenAddress)
    const tx = await WBGContractInstance.methods.transfer(to, value).send({ from })
    return tx
  }

  private async _getWBGLTokenAddress(): Promise<string> {
    try {
      const res = await fetch(`${this.bridgeEndpoint}/contracts`)
      const contracts = await res.json() as IContracts
      return contracts[this.isChainBsc(this.chainId) ? 'bsc' : 'eth']
    } catch (error) {
      return error
    }
  }


  private isChainBsc(chainId: string | number): boolean {
    const bscChainIds: (string | number)[] = ['0x38', '0x61'] // Binance Smart Chain (Mainnet & Testnet) chain IDs
    return bscChainIds.includes(chainId)
  }   /// END OF PRIVATE METHODS

}

