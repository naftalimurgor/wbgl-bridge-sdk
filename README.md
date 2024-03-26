# Bitgesell WBGLBridge SDK
<img src="Icon.png" style="height: 60px;"/>

This is a tiny wrapper around the WBGL bridge for use on the Nodejs backend

> NB: This is highly experimental and for BGL-WBGL swaps, Recommend to use the official bridge at [bglswap.com](https://bglswap.com/)


## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Documentation](#documentation)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Installation

To get started with the Bitgesell WGL Bridge SDK, you can install it using npm:

```bash
npm install wbgl-bridge-sdk
```

or using yarn:

```bash
yarn add wbgl-bridge-sdk
```

## Usage

Import the SDK into your TypeScript project to start using the Bitgesell WGL Bridge functionalities:

```typescript
import Web3 from 'web3'
import PrivateKeyProvider from 'truffle-privatekey-provider'
import { WBGLBridgeSDK, IBridgeConfig } from 'wbgl-bridge-sdk';

const bscProviderRpc = 'https://rpc.ankr.com/bsc'
const MNEMONIC = process.env.MNEMONIC
const bglSeedPhrase = process.env.bglSeedphrase

web3Provider = new HDWalletProvider(MNEMONIC, bscProviderRpc)

const config: IBridgeConfig = {
  provider: web3Provider,
  chainName: ChainNames.BinanceSmartChain,
  chainId: ChaindIds.BinanceSmartChain,
  bridgeEndpoint: 'https://bglswap.com/app/',
  bglPrivateKey: process.env.bglPrivateKey,
  bglSeedPhrase: bglSeedPhrase
}

const accounts = await web3Instance.eth.getAccounts()
recepientBSCAddress = accounts[0] // address 0

// Instantiate the SDK with your provider
const wbglBridge = new WBGLBridgeSDK(config);


// Get bridge health:
const health = await wbglBridge.getBridgeHealth()
console.log(health) // "ok"

// Use the SDK methods to interact with the Bitgesell WBGL Bridge
const balance = await wbglBridge.getBalanceETH();
console.log(`WBGL on Ethereum balance: ${balance}`);
```

## 1.  Swap `WBGL` for `WBGL`
```javascript
const bglAddress = '' // address to receive BGL
const amount = 200 // WBGL amount
const to = '' // BSC/ETH address to send tokens to
const res = await wbglBridge.swapWBGLforBGL(bglAddress, amount, to)
```
## 2. Swap `BGL` for `WBGL`

```typescript
const blgAmountToSwap = 2 // 2BGL
const bglTxFee = 0.0001 // minimum txFee of proposed 10,000 satoshis(0.0001BGL)

const bGLWBGLExchangePair: BGLWBGLExchangePair = {
  sourceWBGLAddress: recepientBSCAddress,
  bglAmount: blgAmountToSwap,
  bglFee: bglTxFee
}

const swapResult = await bGL.swapBGLforWBGL(bGLWBGLExchangePair)
console.log(swapResult)

```
On a sucessful swap: 

```javascript
{
  bglBridgeAddress: 'bgl1qsxt0ktqgxptn6qv6s4jhxe6rappvv6r342vmx3',
  currentWBGLBridgeBalance: '112020.082928590506503209',
  msg: 'You have successfully sent 1 to bgl1qsxt0ktqgxptn6qv6s4jhxe6rappvv6r342vmx3 to receive WBGL,  1 fee is charged. The currently available WBGL balance is 112020.082928590506503209. If you send more BGL than is available to complete the exchange, your BGL will be returned to your address.\n' +
  'Please note, that a fee of 1% will be automatically deducted from the transfer amount. This exchange pair is active for 7 days.',
  bglTxHash: '819eefaf783289c8220b5052ac2e4141b25948a18ee44d713d08db9dab634e0f',
  rpcResult: {
    result: '819eefaf783289c8220b5052ac2e4141b25948a18ee44d713d08db9dab634e0f',
    error: null,
    id: 'curltext'
  }
}
```

## Roadmap

This library is in active development with implemented functions as follows:

### Bridgle methods

The following methods have been implemented and tested with coverage:

- [x] `getBridgeHealth()`
- [x] `getBridgeStatus()`
- [x] `getBalanceBGL()`
- [x] `getBalanceETH()`
- [x] `getBalanceBSC()`
- [x] `getContracts()`

### Swap Methods(in Development)

Swap methods for bridge functionality currently in development []():

- [x] `swapBGLforBGL(bGLWBGLExchangePair: BGLWBGLExchangePair)`
- [x] `swapWBGLforBGL(wBGLBGLExchangePair: BGLWBGLExchangePair)`

## Documentation

For more in-depth information on the SDK's methods, classes, and usage, refer to the [official documentation](https://naftalimurgor.github.io/wbgl-brigde-sdk/).

## Contribution Guidelines

We welcome contributions! Feel free to submit a feature request/file an issue etc.

## License

This SDK is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it according to the terms of the license.

