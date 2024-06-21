import bglunits from 'bgl-units'
import fetch from 'node-fetch'
import { BGLWallet } from '../BglWallet'
import { ChainNames } from '../chains'
import { IBridgeConfig } from '../types'
import { Transaction } from './Transaction'

/**
 * Response of the Bridge when initiating BGL for WBGL swap
 * @param bglAddress the Bridge BGL address to send BGL to
 * @param feePercentage is the fee charged by Bridge on the transfer amount
 * @param balance: current WBGL balance of the Bridge
 */
interface IBridgeResponse {
  message?: string
  error?: string
  status: string;
  id: string;
  bglAddress: string;
  balance: string;
  feePercentage: string;
}

export interface BGlSwapSuccessResult {
  result: string,
  error: null,
  id: 'string'
}

/**
 * An object with BGL/WBGL exchange pair params
 * @param bglAmount amount in BG of BGL to swap
 * @param sourceWBGLAddress Address to recive WBGL tokens to. Should be account with access to
 * Since signed messsages are used to facilitate swap.
 * @param bglFee is fee in BGL(default is .0001) an equivalent of 10,000 satoshis
 */
export interface BGLWBGLExchangePair {
  recepientWBGLAddress: string,
  bglAmount: number,
  bglFee?: number
}

/**
 * BGL <- WBGL, swap BGL and recive WBGL to your bitgesell address,
 */
export class BGL {

  /**
   * Web3 instance to use for Interacting with WBGL contract on
   * BSC, Ethereum, and L2 chains(Arbitrum, Optimism)
   */

  /**
   * Minimum Fee in satoshi units for BGL transaction
   */
  private static minTxFee = bglunits.toSatoshiUnits(0.0001) // 10,000 satoshis

  /**
  * Chain Names for Network to interract with: BSC, Ethereum,
  * Note: Arbitrum and Optimism (L2s) are not supported yet.
  */
  private chainName: string | ChainNames

  /**
   * Current Bridge Endpoint: https://bglswap.com/app/
   * @link https://bglswap.com/
   */
  private bridgeEndpoint: string

  /**
   * an Instance of Bitgesell Wallet to use
   * Signs transactions to approve and transfer BGL to the Bridge in exchange for WBGL
   * @link Read More: https://bglswap.com/
   */
  private bglWallet: BGLWallet

  /**
   * Bitgesell RPC Node to interact with
   */
  private bglRpcNode: string

  /**
   * BGL Wallet PrivateKey to use for sigining transactions
   */
  private readonly bglPrivateKey: string | null


  constructor(config: IBridgeConfig) {
    this.chainName = config.chainName
    this.bridgeEndpoint = config.bridgeEndpoint || 'https://bglswap.com/app/'
    this.bglRpcNode = config.bglRpcUrl || 'https://rpc.bglwallet.io'
    this.bglWallet = new BGLWallet(config)
    this.bglPrivateKey = config.bglPrivateKey || null
  }

  /**
   * 
   *  Send BGL to recieve WBGL tokens to complete the swap
   * @param sourceWBGLAddress Address to send WBGL to: can be BSC address or Ethereum address depending on configuration
   * @param bglAmount amount of BGL to swap for WBGL
   * @link more https://bglswap.com/
   */
  public async swapBGLforWBGL({
    recepientWBGLAddress,
    bglAmount,
    bglFee
  }: BGLWBGLExchangePair) {

    const fee = bglunits.toSatoshiUnits(bglFee) || BGL.minTxFee
    const amountToSwap = bglunits.toSatoshiUnits(bglAmount) - fee

    const bglWallet = this.bglPrivateKey ? await this.bglWallet.createWalletFromPrivateKey() : await this.bglWallet.createWalletFromMnemonic()
    const { address: bglSenderAddress, privateKey } = bglWallet

    const WBGLSourceAddress = recepientWBGLAddress
    const bridgeResponse = await this._submitToBridge(WBGLSourceAddress, this.chainName)


    const {
      bglAddress: bglBridgeAddress,
      feePercentage,
      balance: currentWBGLBalance
    } = bridgeResponse

    if (bridgeResponse?.error) {
      throw new Error(bridgeResponse?.message)
    }

    const txObject = await this._buildBridgeTransactionObject(
      bglSenderAddress,
      amountToSwap,
      bglBridgeAddress,
      privateKey,
      fee
    )

    const txres = await this._broadcastbglTransaction(txObject) as BGlSwapSuccessResult

    if (txres.error) {
      return {
        bglBridgeAddress: null,
        currentWBGLBridgeBalance: null,
        msg: null,
        bglTxHash: txres.result,
        rpcResult: txres
      }
    }

    return {
      bglBridgeAddress: bglBridgeAddress,
      currentWBGLBridgeBalance: currentWBGLBalance,
      msg: `You have successfully sent ${bglAmount} to ${bglBridgeAddress} to receive WBGL,  ${feePercentage} fee is charged. The currently available WBGL balance is ${currentWBGLBalance}. If you send more BGL than is available to complete the exchange, your BGL will be returned to your address.
        Please note, that a fee of 1% will be automatically deducted from the transfer amount. This exchange pair is active for 7 days.`,
      bglTxHash: txres.result,
      rpcResult: txres
    }

  }

  /**
   * 
   * @param txObject transaction object to broadcast. see implementation of building a txObject
   * @returns a response from the Bitgesell RPC node.
   */
  private async _broadcastbglTransaction(txObject: Record<string, string>) {
    const url = new URL(this.bglRpcNode)

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: `{"jsonrpc":"1.0","id":"curltext","method":"sendrawtransaction","params":["${txObject}"]}`,
    }

    try {

      const res = await fetch(url.origin, {
        body: payload.body,
        headers: payload.headers,
        method: 'POST'
      })
      const result = await res.json()
      return result as BGlSwapSuccessResult
    } catch (error) {
      console.log(error)
      return error
    }
  }

  private async _submitToBridge(receivingAddress: string, chainName: string) {
    const dataObject = {
      address: receivingAddress,
      chain: chainName,
    }

    const headers = {
      'Content-Type': 'application/json',
    }

    const submitBbglEndPoint = `${this.bridgeEndpoint}/submit/bgl`
    const bridgeResponse = await this._post(submitBbglEndPoint, headers, dataObject) as IBridgeResponse
    return bridgeResponse
  }

  private async _fetchAddressUTxos(bglAddress: string) {
    const bglAPIV1Endpoint = 'https://api.bitaps.com/bgl/v1/blockchain'
    const bglAddressUTXOEndpoint = `${bglAPIV1Endpoint}/address/utxo/${bglAddress}`

    try {
      const res = await fetch(bglAddressUTXOEndpoint)
      const utxo = await res.json()
      return utxo
    } catch (error) {
      console.error(error)
      return
    }
  }

  private async _buildBridgeTransactionObject(
    bglFromPublicAddress: string,
    bglAmountToSwap: number,
    bridgeBGLaddress: string,
    privateKey: string,
    bglTxFee: number
  ) {

    const txObject = Transaction.makeTxObject()

    const utxosData = await this._fetchAddressUTxos(bglFromPublicAddress)
    if (!utxosData) throw new Error(`Failed to fetch utxo output for ${bglFromPublicAddress}`)

    const { data: utxos } = utxosData
    const data = await this._getBglAddressBalance(bglFromPublicAddress)

    const { balance: blgSourceAddressBalance } = data

    const newBGLBalanceAfterSwap = (blgSourceAddressBalance - bglAmountToSwap - bglTxFee)


    if (utxos.length) {
      for (const key in utxos) {
        const utxo = utxos[key]
        txObject.addInput({
          txId: utxo.txId,
          vOut: utxo.vOut,
          address: bglFromPublicAddress,
        })
      }

      txObject.addOutput({
        value: bglAmountToSwap,
        address: bridgeBGLaddress
      })

      if (newBGLBalanceAfterSwap > 0) {

        txObject.addOutput({
          value: newBGLBalanceAfterSwap,
          address: bglFromPublicAddress
        })
      }

      let utxoCount = 0
      for (const key in utxos) {
        const utxo = utxos[key]
        txObject.signInput(utxoCount, {
          privateKey: privateKey,
          value: utxo.amount
        })

        utxoCount++
      }

      const newTx = txObject.serialize()
      return newTx
    }
  }

  private async _post(
    endpoint: string,
    headers: Record<string, string>,
    payload: { address: string; chain: string }
  ) {
    try {
      const res = await fetch(endpoint, {
        body: JSON.stringify(payload),
        headers: headers,
        method: 'POST'
      },
      )
      const data = await res.json()
      return data
    } catch (error) {
      return error
    }
  }

  private async _getBglAddressBalance(bglAddress: string) {
    const bglAPIV1Endpoint = 'https://api.bitaps.com/bgl/v1/blockchain'
    try {
      const response = await fetch(`${bglAPIV1Endpoint}/address/state/${bglAddress}`)
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error(error)
    }
  }

}
