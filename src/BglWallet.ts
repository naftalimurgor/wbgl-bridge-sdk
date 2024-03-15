import jsbgl from '@naftalimurgor/jsbgl'

import { IBridgeConfig } from './types'

export class BGLWallet {
  private readonly privateKey: string
  private readonly seedPhrase: string

  constructor(config: IBridgeConfig) {
    this.privateKey = config.bglPrivateKey
    this.seedPhrase = config.bglSeedPhrase || ''
  }

  /// Begin Public Methods
  /**
   * createWallet imports a wallet from privateKey or Mnemonic
   */
  public async createWalletFromPrivateKey() {
    return await this._importWalletFromPrivateKey()

  }
  /**
  * createWallet imports a wallet from privateKey or Mnemonic
  */
  public async createWalletFromMnemonic() {
    return await this._importWalletFromMnemonic()
  }
  /// end Public methods

  /// Begin Private Methods
  /**
   * @private
   * importWalletFromPrivateKey imports wallet from Bitgesell Mainnet privateKey
   */
  private async _importWalletFromPrivateKey() {
    try {
      await jsbgl.asyncInit(globalThis)
      const wallet = new globalThis.Wallet({ from: this.privateKey })
      const address = new globalThis.Address(this.privateKey)
      return { wallet, address: address.a, privateKey: this.privateKey }

    } catch (error) {
      console.error(error)
      return { wallet: null, address: null, privateKey: null }
    }
  }

  /**
   * @private
   * importWalletFromMnemonic imports from Bitgesell Mainnet seedphrase
   * @param indexAddress the address to use, defaults to address 0, the index address
   */
  private async _importWalletFromMnemonic(indexAddress = 0) {
    try {
      await jsbgl.asyncInit(globalThis)
      const wallet = new globalThis.Wallet({ from: this.seedPhrase })
      const address = wallet.getAddress(indexAddress) // index address
      return {
        address: address.address,
        wallet,
        privateKey: address.privateKey
      }
    } catch (error) {
      console.error(error)
      return { wallet: null, address: null, privateKey: null }

    }
  }
  /// End Private Methods
}