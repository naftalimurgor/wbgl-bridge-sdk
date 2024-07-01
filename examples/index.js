const {
  ChainNames,
  WBGLBridgeSDK,
  ChaindIds
} = require('wbgl-bridge-sdk')
const { ethers } = require('ethers')
const dotenv = require('dotenv')
dotenv.config()

const main = async () => {
  const bscProvider = 'https://rpc.ankr.com/bsc'
  const provider = new ethers.providers.JsonRpcProvider(bscProvider)

  const evmPrivateKey = process.env.EVM_PRIVATE_KEY
  console.log(evmPrivateKey)
  const signer = new ethers.Wallet(evmPrivateKey, provider)
  const bnbAddress = await signer.getAddress()


  const config = {
    evmPrivateKey: evmPrivateKey, // Arbitrum, BNB chain, Ethereum privateKey etc
    provider: provider,
    chainName: ChainNames.Ethereum,
    chainId: ChaindIds.Ethereum,
    bridgeEndpoint: 'https://bglswap.com/app/',
    bglPrivateKeyOrSeed: process.env.BGL_PRIVATEKEY_OR_SEED
  }
  const wbglBridgesdkInstance = new WBGLBridgeSDK(config)

  // 1. BGL -> WBGL swap

  const swapBGLForWBGL = async () => {
    const bglAmountToSwap = 1 // 1BGL
    const bglTxFee = 0.0001 // minimum txFee of proposed 10,000 satoshis(0.0001BGL)

    const BGLWBGLExchangePair = {
      recepientWBGLAddress: bnbAddress,
      bglAmount: bglAmountToSwap,
      bglFee: bglTxFee
    }
    try {
      const result = await wbglBridgesdkInstance.bgl.swapBGLforWBGL(BGLWBGLExchangePair)
      console.log(result)
      return result
    } catch (error) {
      console.error(error)
    }
  }

  const bglSwap = await swapBGLForWBGL()
  console.log(bglSwap)

  // WBGL -> BGL
  const swapWBLforBGL = async () => {
    const wbglPair = {
      bglAddress: 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn',
      to: bnbAddress,
      wbglAmount: 1
    }
    try {
      const result = await wbglBridgesdkInstance.wbgl.swapWBGLforBGL(wbglPair)
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }
  const result = await swapWBLforBGL()
  console.log(result)
}

main().catch(err => console.log(err))