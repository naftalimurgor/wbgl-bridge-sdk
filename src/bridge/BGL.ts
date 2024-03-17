import Web3 from 'web3'
import fetch from 'node-fetch'
import { IBridgeConfig } from '../types'
import { ChainNames } from '../chains'
import { BGLWallet } from '../BglWallet'
import jsbgl from '@naftalimurgor/jsbgl'

/**
 * Response of the Bridge when initiating BGL for WBGL swap
 * @param bglAddress the Bridge BGL address to send BGL to
 * @param feePercentage is the fee charged by Bridge on the transfer amount
 * @param balance: current WBGL balance of the Bridge
 */
interface IBridgeResponse {
  status: string;
  id: string;
  bglAddress: string;
  balance: string;
  feePercentage: string;
}

/**
 * BGL <- WBGL, swap BGL and recive WBGL to your bitgesell address,
 */
export class BGL {

  /**
   * Web3 instance to use for Interacting with WBGL contract on
   * BSC, Ethereum, and L2 chains(coming soon)
   */
  private web3: Web3

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

  private bglRpcNode: string
  private readonly privateKey: string | null

  constructor(config: IBridgeConfig) {
    this.web3 = new Web3(config.provider)
    this.chainName = config.chainName
    this.bridgeEndpoint = config.bridgeEndpoint || 'https://bglswap.com/app/'
    this.bglRpcNode = config.blgRpcNode || 'https://rpc.bglwallet.io'
    this.bglWallet = new BGLWallet(config)
    this.privateKey = config.bglPrivateKey || null
  }

  /**
   * 
   *  Send BGL to recieve WBGL tokens to complete the swap
   * @param sourceAddress Address to send WBGL to: can be BSC address or Ethereum address
   * @param bglAmount amount of BGL to swap for WBGL
   * @link more https://bglswap.com/
   */
  public async swapBGLforWBGL(
    sourceAddress: string,
    bglAmount: number,
  ) {

    const bglWallet = this.privateKey ? await this.bglWallet.createWalletFromPrivateKey() : await this.bglWallet.createWalletFromMnemonic()
    const { address: bglSenderAddress, privateKey } = bglWallet
    // console.log('privateKey:', privateKey)

    const WBGLAddress = sourceAddress || await this.web3.eth.getAccounts()[0]
    const bridgeResponse = await this._submitToBridge(WBGLAddress, this.chainName)

    const {
      bglAddress: bglBridgeAddress,
      feePercentage,
      balance: currentWBGLBalance
    } = bridgeResponse

    const txObject = await this._buildBridgeTransactionObject(
      bglSenderAddress,
      bglAmount,
      bglBridgeAddress,
      privateKey
    )

    const txres = await this._broadcastbglTransaction(txObject)

    return {
      bglBridgeAddress: bglBridgeAddress,
      currentWBGLBridgeBalance: currentWBGLBalance,
      msg: `You have successfully sent ${bglAmount} to ${bglBridgeAddress} to receive WBGL,  ${feePercentage} fee is charged. The currently available WBGL balance is ${currentWBGLBalance}. If you send more BGL than is available to complete the exchange, your BGL will be returned to your address.
      Please note, that a fee of 1% will be automatically deducted from the transfer amount. This exchange pair is active for 7 days.`,
      blgTxHash: txres
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
      const txres = await res.json()
      console.log(txres)
    } catch (error) {
      console.log(error)
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
  ) {
    await jsbgl.asyncInit()
    const txObject = new globalThis.Transaction()

    const utxosData = await this._fetchAddressUTxos(bglFromPublicAddress)
    if (!utxosData) throw new Error(`Failed to fetch utxo output for ${bglFromPublicAddress}`)

    const { data: utxos } = utxosData
    console.log('data>>>:', utxos)
    const data = await this._getBglAddressBalance(bglFromPublicAddress)
    // console.log('data:', data)

    const { balance: blgSourceAddressBalance } = data
    console.log(blgSourceAddressBalance)

    const newBGLBalanceAfterSwap = (blgSourceAddressBalance - bglAmountToSwap)
    console.log(newBGLBalanceAfterSwap)

    if (utxos.length) {
      for (const key in utxos) {
        const utxo = utxos[key]
        // console.log('utxo', utxo)
        txObject.addInput({
          txid: utxo.txId,
          vOut: utxo.vOut,
          address: bglFromPublicAddress,
        })
      }

      txObject.addOutput({
        value: bglAmountToSwap,
        address: bridgeBGLaddress
      })

      if (newBGLBalanceAfterSwap > 0) {
        console.log('new balance after swap:', newBGLBalanceAfterSwap)
        txObject.addOutput({
          value: newBGLBalanceAfterSwap,
          address: bglFromPublicAddress
        })
      }

      let utxoCount = 0
      // sign tx object
      for (const key in utxos) {
        // console.log('signingPrivatekey', privateKey)
        const utxo = utxos[key]
        console.log(utxo)
        txObject.signInput(utxoCount, {
          privateKey: privateKey,
          value: utxo.amount
        })

        utxoCount++
      }
      const newTx = txObject.serialize()
      console.log(newTx)
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
      const res = await fetch(`${bglAPIV1Endpoint}/address/state/${bglAddress}`)
      const data = await res.json()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      return data.data // this is how Bitgesell V1 API structures the response, everything is inside a data {} in the response
    } catch (error) {
      console.error(error)
    }
  }
}
