import jsbgl from '@naftalimurgor/jsbgl'

import { IBridgeConfig } from './types'

export class BGLWallet {
  private readonly privateKeyOrSeed: string

  constructor(config: IBridgeConfig) {
    if (!config.bglPrivateKeyOrSeed) {
      throw new Error('No PrivateKey or Seedphrase provided set. Please provide Seed or PrivateKey!')
    }
    this.privateKeyOrSeed = config.bglPrivateKeyOrSeed
  }

  /// Begin Public Methods
  /**
   * createWallet imports a wallet from privateKey or Mnemonic
   */
  public async createWallet() {

    let wallet: { address: string; wallet: string; privateKey: string }

    try {
      await jsbgl.asyncInit(globalThis)

      if (globalThis.isMnemonicCheckSumValid(this.privateKeyOrSeed)) {
        wallet = await this._importWalletFromMnemonic()
        return wallet
      } else if (globalThis.isWifValid(this.privateKeyOrSeed)) {
        wallet = await this._importWalletFromPrivateKey()
        return wallet
      }
    } catch (error) {
      return error
    }
  }
  /**
  * createWallet imports a wallet from privateKey or Mnemonic
  */

  /// BEGIN PRIVATE METHODS
  private _importWalletFromPrivateKey = async () => {
    try {
      await jsbgl.asyncInit(globalThis)
      const wif = await this._privateKeyToWIF(this.privateKeyOrSeed)
      const privateKeyInstance = new globalThis.PrivateKey(wif)
      const wallet = new globalThis.Address(privateKeyInstance)
      return {
        address: wallet.address,
        wallet: wallet,
        privateKey: wallet.privateKey
      }
    } catch (error) {
      throw new Error(`Failed: ${error}`)
    }
  }

  private _privateKeyToWIF = async (privatekey: string) => {
    try {
      await jsbgl.asyncInit(globalThis)
      const privateKey = new globalThis.PrivateKey(privatekey)
      return privateKey.wif
    } catch (error) {
      throw new Error(`Failed: ${error}`)

    }
  }
  /// end Public methods

  /// Begin Private Methods
  /**
   * @private
   * importWalletFromPrivateKey imports wallet from Bitgesell Mainnet privateKey
   */


  /**
   * @private
   * importWalletFromMnemonic imports from Bitgesell Mainnet seedphrase
   * @param indexAddress the address to use, defaults to address 0, the index address
   */
  private async _importWalletFromMnemonic(indexAddress = 0) {
    try {
      await jsbgl.asyncInit(globalThis)

      const wallet = new globalThis.Wallet({ from: this.privateKeyOrSeed })
      const address = wallet.getAddress(indexAddress) // index address
      return {
        address: address.address,
        wallet,
        privateKey: address.privateKey
      }

    } catch (error) {
      throw new Error(`${error}`)
    }
  }
  /// End Private Methods
}