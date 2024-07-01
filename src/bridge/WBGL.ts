import {
  ethers,
  Wallet
} from 'ethers'

import fetch from 'node-fetch'
import WBGL_ABI from '../abi/WBGL'
import { ChaindIds } from '../chains'
import { IBridgeConfig } from '../types'

import {
  WBGL_CONTRACT_ADDRESS_BNB,
  WBGL_CONTRACT_ADDRESS_ETH
} from './constants'

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

export interface WBGLBGLExchangePairResult {
  transactionHash: string
  wbglBalance: string
  balance: string
}

type Provider = ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider

export class WBGL {

  /**
   * @member A provider instance to use.
   */
  private readonly provider: Provider
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
   * @param wbglAmount amount of WBGL tokens to swap
   * swapWBGLforBGL swaps WBGL for BGL to recepient Bitgesell address
   */
  public async swapWBGLforBGL({
    bglAddress,
    wbglAmount,
  }: WBGLBGLExchangePair): Promise<WBGLBGLExchangePairResult> {
    try {
      const signer = await this._getSigner()
      const account = await signer.getAddress()
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

      const txRes = await this._sendWbgl(sendAddress, wbglAmount) as WBGLBGLExchangePairResult
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
    to: string,
    amount: number
  ) {

    const privateKey = this.evmPrivateKey
    const signer = new ethers.Wallet(privateKey, this.provider)
    const recepient = to

    const wbgContractInstance = new ethers.Contract(this._getWBGLTokenAddress(), WBGL_ABI, signer)

    const amountToSend = ethers.utils.parseUnits(String(amount), 18)

    try {
      const latestFees = await this.provider.getFeeData()
      const tokenBalance = await wbgContractInstance.balanceOf(signer.address)

      if (tokenBalance.lt(amountToSend)) {
        throw new Error('Insufficient Token Balance')
      }

      const gasEstimate = await wbgContractInstance.estimateGas.transfer(recepient, amountToSend)

      const maxFeePerGas = latestFees.maxFeePerGas
      const ethBalance = await this.provider.getBalance(signer.address)

      // Calculate the total ether required for gas
      const gasCost = gasEstimate.mul(maxFeePerGas)

      if (ethBalance.lt(gasCost)) {
        throw new Error('Insufficient  balance to cover Token Swap')
      }

      const tx = await wbgContractInstance.transfer(recepient, amountToSend, {
        gasLimit: gasEstimate,
        maxFeePerGas: latestFees.maxFeePerGas,
        maxPriorityFeePerGas: latestFees.maxPriorityFeePerGas,
        type: 2
      })

      const txReceipt = await tx.wait()

      const tokenBalanceAfterSend = await wbgContractInstance.balanceOf(signer.address)
      const ethBalanceAfterSend = await this.provider.getBalance(signer.address)

      return {
        transactionHash: txReceipt.transactionHash,
        wbglBalance: ethers.utils.formatUnits(tokenBalanceAfterSend, 18),
        balance: ethers.utils.formatEther(ethBalanceAfterSend)
      }

    } catch (err) {
      return err
    }
  }

  private _getWBGLTokenAddress(): string {
    // @TODO: add Optimism and Arbitrum contract addresses
    return this.isChainBsc(this.chainId) ? WBGL_CONTRACT_ADDRESS_BNB : WBGL_CONTRACT_ADDRESS_ETH
  }


  // @TODO: include Arbitrum, Optimism checks
  private isChainBsc(chainId: string | number): boolean {
    const bscChainIds: (string | number)[] = ['0x38', '0x61'] // BNB Smart Chain (Mainnet & Testnet) chain IDs
    return bscChainIds.includes(chainId)
  }

  private async _getSigner() {
    if (this.evmPrivateKey) return new Wallet(this.evmPrivateKey, this.provider)
    else return this.provider.getSigner() // Web3Provider injected by MetaMask web wallets
  } /// END OF PRIVATE METHODS

}

