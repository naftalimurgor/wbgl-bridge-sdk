/* eslint-disable @typescript-eslint/no-var-requires */
const HdWalletProvider = require('@truffle/hdwallet-provider')
/**
 * @param  {Object}  signingAuthority An object with either a propery of privateKeys or a 12-word phrase for derivin wallets and addresses.
 * @param  {string} providerOrUrl Any RPC provider for EVM compatible network.
 * @description Creates a provider with signer/wallets to pass to Web3 instance {@link https://web3js.readthedocs.io/en/v3.0.0-rc.5/web3.html#providers}.
 */
function createOptimismProvider(signingAuthority, providerOrUrl) {
  const mnemonic = getMnemonic(signingAuthority)
  const privateKeys = getPrivateKeys(signingAuthority)

  const provider = new HdWalletProvider({
    mnemonic,
    providerOrUrl: providerOrUrl,
    privateKeys,
    pollingInterval: 18000,
    shareNonce: false
  })
  return provider
}

function getPrivateKeys(signingAuthority) {
  if ('privateKeys' in signingAuthority) return signingAuthority.privateKeys
  else return undefined
}

function getMnemonic(signingAuthority) {
  if ('mnemonic' in signingAuthority) return signingAuthority.mnemonic
  else return undefined
}

module.exports = createOptimismProvider