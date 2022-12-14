 # NFTKAET

NFTKAET is a NFT marketplace where users can mint their pictures as NFT, list their NFTs for sale, and as well buy NFTs from other user.

# 🛠 Technology Stack & Tools

- Sophia (Writing Smart Contract)
- Javascript (NextJs & Unit Testing)
- aepp-sdk (Blockchain Interaction)
- aeproject (Smart Contract Development Framework)
- IPFS (Image Storage)

# ⛓ Blockchain Protocol used

- AEX-141 Non Fungible Token Standard

# ⚙ Requirements For Initial Setup

- Install NodeJS, should work with any node version above 14.0.0
- Download and setup Docker
- Note: on windows WSL 2 must be used

# 🚀 Quick Start

📄 Clone or fork NFTKAET:

```
https://github.com/paschal533/NFTKAET.git
```
💿 Install all dependencies:
 
```
$ cd NFTKAET
$ cd frontend
$ npm install 
```

# 🎗 Add enviroment varibles

Rename the file `env.local.example` to `env.local`

Add all the required enviroment varibles in the file

```
NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID =
NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET =

```

# 🚴‍♂️ Run your App:

```
npm run dev
```

- Note :- This app was deployed to aeternity testnet, so you need to have super hero wallet extension installed on your chrome before you can Interact with the app.

# 📄 interacting with the Smart-contract

```
$ cd NFTKAET
$ cd smart-contract
$ npm install
```

# 🎗 Running a local environment

```
aeproject env
```

This will run a local æternity network in dev-mode (node, compiler and nginx-proxy).

To stop an already spawned local environment use `aeproject env --stop`

Further explained in [Environment Documentation.](https://github.com/aeternity/aeproject/blob/main/docs/cli/env.md)

# 🛠 Test the Smart-contract:

```
aeproject test
```

This will run the tests located in ./test folder. Further explained in [Testing Documentation.](https://github.com/aeternity/aeproject/blob/main/docs/cli/test.md)

# 🔗 Deploy the Smart-contract:

Install aepp-cli

```
sudo npm i -g @aeternity/aepp-cli
```

Then create a wallet with aecli

```
aecli account create sample-wallet
```

Deploy the smart contract with the wallet you created

```
aecli contract deploy sample-wallet --contractSource contracts/NFTMarketplace.aes
```
# 📄 Smart-contract address

```
ct_25dDFHCSJYAGUssjuqWvnrMRCbvGWveo5sPXMJZiCLeyNsEC5H
```

# 📜 aeternity Testnet Explorer

```
https://explorer.testnet.aeternity.io/contracts/transactions/ct_25dDFHCSJYAGUssjuqWvnrMRCbvGWveo5sPXMJZiCLeyNsEC5H

```