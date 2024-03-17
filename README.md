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
import { WBGLBridgeSDK } from 'wbgl-bridge-sdk';

const privateKey = '4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
const provider = new PrivateKeyProvider(privateKey, 'https://mainnet.infura.com')

const config = {
  provider,
  chainName: 'Eth',
  chainId: 1
}

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

## Roadmap

This library is in active development with implemented functions as follows:

### Bridgle methods

The following methods have been implemented and tested with coverage:

```js
[✔️] getBridgeHealth()
[✔️] getBridgeStatus()
[✔️] getBalanceBGL()
[✔️] getBalanceETH()
[✔️] getBalanceBSC()
[✔️] getContracts()
```

### Swap Methods(in Development)

Swap methods for bridge functionality currently in development []():

```js
[] swapWBGLforBGL(bglAddress: string, to: string, amount: number)
[] swapBGLforWBGL(sourceAddress:string,bglAmount: number)
```
## Documentation

For more in-depth information on the SDK's methods, classes, and usage, refer to the [official documentation](docs/).

## Contribution Guidelines

We welcome contributions! Feel free to submit a feature request/file an issue etc.

## License

This SDK is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it according to the terms of the license.

