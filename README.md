# 🚀 Kick-Ass NFT

A simple NFT minting and trading project for Crypto starters to learn Solidity, Web3.js, Truffle and other stuffs. We implement the ERC721, Non-Fungible Token Standard contracts. Just upload an image, you can mint your owned NFT art collectable. What's more amazing is that you can trade them with others to earn ETH in our concise and easy to use marketplace.
## Project Layout

- `packages/dapp` — A frontend project based on Vue3 + Vite + ElementPlus + Web3.js.
- `packages/truffle` — Truffle project with Solidity(>=0.8) and Openzeppelin.

# 📱 Screenshot

> The following image is the screenshot of **Marketplace** which list all available selling NFTs, you can buy it with ETH assets.

![Marketplace screenshot](https://bafybeibu22fhnupftb6f3d327q4wmtdqesjxi3oupmwtt72ip4raccq4n4.ipfs.dweb.link/)

> And, this following image is the screenshot of **My Collection**. We can mint new NFT here. My owned nfts are listed in **My Collection** section. Besides, the NFTs I am selling are also listed in the **On Sale** section below. Notice, you wouldn't see anything if you haven't connected your wallet (For example, 🦊 MetaMask).

![collectable screenshot](https://bafkreigphwvsq3e5y24ntyygbzxxxhqaaasoxp7vvtxer3ibd7ewd45u7q.ipfs.dweb.link/)

# 🏄‍♂️ Quick Start

## Prerequisites

To build and run this project, you need to have the following installed on your environment:

* Node.js (> 12)
* Yarn (> 1.22.0)
* Truffle (> 5.4.0)
* Solidity (> 0.8)
* Ganache (> 2.5.0, _OPTIONAL_)

Besides, we are using the following services:

* Infura - https://infura.io/
* NFT.Storage - https://nft.storage/

## Manual Setup

Firstly, install dependencies for all packages.

```bash
yarn install
```

Secondly, create a `.env` file under `packages/truffle` and fill required environment variables.

```bash
cd packages/truffle

cp .env.example .env && vim .env
```
- `INFURA_PROJECT_ID` - infura.io project id, you can find in project `SETTINGS > GENERAL > KEYS`, visit: [infura.io](https://infura.io/).
- `HD_WALLET_SECRET` - your HD wallet BIP39 mnemonic.

Then, we compile and deploy smart contracts to Ethereum testnet.

```bash
truffle deploy --network ganache --reset
```

> If you are going to deploy contracts to Ganache, Ganache must be listening on port 7545 as specified in the truffle config file.

Lastly, open a second terminal window, create a `.env` file under `packages/dapp` and fill required environment variables.

```bash
cd packages/dapp

cp .env.example .env && vim .env
```

- `VITE_NFT_STORAGE` - NFT.Storage API key, you can create new API key when you logined, visit: [NFT.Storage](https://nft.storage/).
- `VITE_IPFS_GATEWAY` - IPFS gateway base url, only support **Path** resolution style, default is https://ipfs.io/ipfs/.

Finally, start your frontend.

```bash
yarn run dev
```

Now, open http://localhost:8000 to see the app.

# 🎲 Test

After you setup this project manually, then you can run some tests.

## Contract test

Start the truffle development console:

```bash
cd packages/truffle

truffle develop
```

Then, Execute truffle test.

```bash
truffle(develop)> test
```

# ⚖️ License

The Kick-Ass NFT project is under the MIT license.