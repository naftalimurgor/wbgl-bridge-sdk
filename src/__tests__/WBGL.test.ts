import * as matchers from 'jest-extended'

import { IBridgeConfig } from '../types'

import { ChainNames, ChaindIds } from '../chains'
import createOptimismProvider from './utils/createOptimismProvider'
import { WBGL } from '../bridge/WBGL'


expect.extend(matchers)

describe('WBGL class tests on Ethereum', () => {

  let wBGL: WBGL
  let web3Provider = null
  const recepientWBGLAddress = ''
  const bglAddress = 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn'

  beforeAll(() => {
    const optimimisRPC = process.env.providerUrl
    const MNEMONIC = process.env.MNEMONIC
    const signingAuthority = { mnemonic: MNEMONIC }

    web3Provider = createOptimismProvider(signingAuthority, optimimisRPC)

    const config: IBridgeConfig = {
      //Ideally, this would be a provider i.e MetaMask inpage injected window.ethereum (browser environment) or
      // a Provider(with a signer) as described here: 
      provider: web3Provider,
      chainName: ChainNames.Ethereum,
      chainId: ChaindIds.Ethereum,
      bridgeEndpoint: 'https://bglswap.com/app/'
    }

    wBGL = new WBGL(config)
  })

  afterAll(() => {
    web3Provider.engine.stop()
  })

  it('test that WBGL instantiates correctly', () => {
    expect(wBGL).toBeInstanceOf(WBGL)
  })

  it('should swap WBGL tokens for BGL via the Bridge', () => {
    console.log(recepientWBGLAddress)
    console.log(bglAddress)
    // refer to web app implementation
  })

})
