import jsbgl from '@naftalimurgor/jsbgl'

export class Transaction {
  private static txInstance: Transaction
  private constructor() {
    this._initJsbglModule()
  }

  public static makeTxObject() {
    if (!this.txInstance) {
      this.txInstance = new Transaction()
      return new globalThis.Transaction()
    }
  }

  /**
   * 
   * Initializes the jsbgl module, by injecting the module to the global scope
  */
  private _initJsbglModule() {
    return Promise.resolve(jsbgl.asyncInit())
  }
}