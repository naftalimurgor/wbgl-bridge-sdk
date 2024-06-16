import { ethers, Wallet } from 'ethers'
import fetch from 'node-fetch'
import { IContracts } from '.'
import WBGL_ABI from '../abi/WBGL'
import { ChaindIds } from '../chains'
import { IBridgeConfig } from '../types'
import { WBGL_CONTRACT_ADDRESS_BNB, WBGL_CONTRACT_ADDRESS_ETH } from './constants'

/**
 * @param bglAddress is the address to receive BGL to
 * @param wbglAmount is the amount of WBGL tokens to swap for BGL amount
 * @param sourceWBGLAddress is the address/account containing WBGL tokens to swap. 
 * NOTE: should be address linked to the signer(wallet) to be able to sign messages authorizing the swap.
 */
export interface WBGLBGLExchangePair {
  bglAddress: string
  to: string
  sourceWBGLAddress?: string
  wbglAmount: number
}

export class WBGL {
  /**
   * @member web3 instance to use.
   */
  private readonly provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider
  /**
   * @member chainId The chainId of the network to use
   */
  private readonly chainId: number | string | ChaindIds
  private readonly chainName: string
  private readonly bridgeEndpoint = 'https://bglswap.com/app/'
  private readonly evmPrivateKey: string

  constructor(config: IBridgeConfig) {
    this.provider = config.provider
    this.chainId = config.chainId
    this.chainName = config.chainName
    this.evmPrivateKey = config.evmPrivateKey
  }

  /// START PUBLIC METHODS
  /**
   * @param bglAddress Bitgesell address to receive BGL
   * @param from
   * swapWBGLforBGL swaps WBGL for BGL to recepient Bitgesell address
   */
  public async swapWBGLtoBGL({
    bglAddress,
    wbglAmount,
    sourceWBGLAddress
  }: WBGLBGLExchangePair) {
    try {
      const signer = await this._getSigner()
      const account = sourceWBGLAddress || await signer.getAddress()
      const signature = await this._signMessage(bglAddress)

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
  private async _signMessage(message: string) {
    const signer = await this._getSigner()
    const signedMessage = await signer.signMessage(message)
    return signedMessage
  }



  private async _sendWbgl(
    from: string,
    to: string,
    amount: number
  ) {
    try {
      const txData = {
        to,
        gasLimit: null,
        nonce: null,
        maxFeePerGas: null,
        value: null, // 
        maxPriorityFeePerGas: null
      }

      const value = ethers.utils.parseUnits(String(amount), 18)
      const tokenAddress = this._getWBGLTokenAddress()
      const signer = await this._getSigner()
      const nonce = await signer.getTransactionCount()
      const feeData = await signer.getFeeData()
      const price = feeData.maxFeePerGas

      // TODO: perform gas estimate to avoid exhorbitant gas fees
      const WBGLContractInstance = new ethers.Contract(tokenAddress, WBGL_ABI)
      const estimate = WBGLContractInstance.transfer.estimateGas(to, value)
      const result = await estimate()

      txData.value = value
      txData.gasLimit = result
      txData.nonce = nonce
      txData.maxFeePerGas = price
      txData.maxPriorityFeePerGas = price.div(10)

      // const fee = price.mul(txData.gasLimit)

      const tx = await WBGLContractInstance.methods.transfer(to, value).send({ from })
      const request = await WBGLContractInstance.transfer(txData.to, txData.value, tx)
      return request

    } catch (error) {
      return error
    }
  }

  private _getWBGLTokenAddress(): string {
    // @TODO: add Optimism and Arbitrum contract addresses
    return this.isChainBsc(this.chainId) ? WBGL_CONTRACT_ADDRESS_BNB : WBGL_CONTRACT_ADDRESS_ETH
  }


  // @TODO: include Arbitrum, Optimism checks
  private isChainBsc(chainId: string | number): boolean {
    const bscChainIds: (string | number)[] = ['0x38', '0x61'] // Binance Smart Chain (Mainnet & Testnet) chain IDs
    return bscChainIds.includes(chainId)
  }

  private async _getSigner() {
    if (this.evmPrivateKey) return new Wallet(this.evmPrivateKey, this.provider)
    else return this.provider.getSigner() // Web3Provider injected by MetaMask web wallets
  } /// END OF PRIVATE METHODS

}

