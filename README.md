# Bitgesell WBGLBridge SDK
<img src="Icon.png" style="height: 60px;"/>

This is a wrapper around the WBGL bridge for use on the Nodejs backend and Browsers written in TypeScript.

> NB: To access the Bridge, we recommend visiting the official bridge at [bglswap.com](https://bglswap.com/)


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

## Initialization

```typescript
import { ethers } from 'ethers'

import {
  ChaindIds,
  ChainNames,
  IBridgeConfig,
  WBGLBridgeSDK
  BGLWBGLExchangePair,
  WBGLBGLExchangePair,
} from 'wbgl-bridge-sdk'

const provider = new ethers.providers.JsonRpcProvider(bscNodeRPC)
const bscNodeRPC = 'https://rpc.ankr.com/bsc'

const config: IBridgeConfig = {
  evmPrivateKey: process.env.EVM_PRIVATEKEY as string,
  provider: provider,
  chainName: ChainNames.Ethereum,
  chainId: ChaindIds.Ethereum,
  bridgeEndpoint: 'https://bglswap.com/app/',
  bglPrivateKey: process.env.BGL_PRIVATEKEY as string
}

const WBGLBridgeSDKInstance = new WBGLBridgeSDK(config)

```

### 1.  Swap `WBGL` Tokens for `BGL`
```typescript
// address to receieve bgl from

const bglAddress = 'bgl1qh3tsz3a7l3m49xaq4xcdx8aefthchuqagmspcn' 

const wbglPair: WBGLBGLExchangePair = {
  bglAddress: bglAddress,
  wbglAmount: 5
}
const swapResult = await WBGLBridgeSDKInstance.swapWBGLtoBGL(wbglPair)
console.log(swapResult)
```

### 2. Swap `BGL` for `WBGL` Tokens to BSC/Ethereum account

```typescript
const blgAmountToSwap = 1 // 1BGL
const bglTxFee = 0.0001 // A minimum txFee of proposed 10,000 satoshis(0.0001BGL)

const recepientBNBAddress = '0x309C7057d20EC9EB67b21005972fF19965483Fbf'

const bGLWBGLExchangePair: BGLWBGLExchangePair = {
  recepientWBGLAddress: recepientBNBAddress,
  bglAmount: blgAmountToSwap,
  bglFee: bglTxFee
}

const swapResult = await BGLInstance.swapBGLforWBGL(bGLWBGLExchangePair)
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

This library is in active development(currently in Beta!) with implemented functions as follows:

### API

The following methods have been implemented and tested with coverage on `Ethereum` and `BNBSmartChain`:

- [x] `getBalanceBGL()`
- [x] `getBalanceEthereum)`
- [x] `getBalanceBNBChain()`
- [x] `getBalanceArbitrumChain()`
- [x] `getBalanceOptimismChain()`

- [x] `swapBGLforBGL(bGLWBGLExchangePair: BGLWBGLExchangePair)`
- [x] `swapWBGLToBGL(wBGLBGLExchangePair: BGLWBGLExchangePair)`
- [] `getContracts()`
- [] `getBridgeHealth()`
- [] `getBridgeStatus()`

## Documentation

For more in-depth information on the SDK's methods, classes, and usage, refer to the [official documentation](https://naftalimurgor.github.io/wbgl-brigde-sdk/).

## Contribution Guidelines

1. Contributions are welcome with tests to keep the coverage high
We welcome contributions! Feel free to submit a feature request/file an issue etc.

## License

This SDK is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it according to the terms of the license.

