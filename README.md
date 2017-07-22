## Demo app using Ethereum / Truffle / IPFS 
User can upload a photo, store it in IPFS and receive some funds if the content gets likes.  
The contract is used to manage users and the hash of the content.

### truffle-init-webpack
Example webpack project with Truffle. Includes contracts, migrations, tests, user interface and webpack build pipeline.

## Usage

`` npm install ``

Start testrpc: 

`` testrpc ``

Compile the contracts:

`` truffle compile ``

Migrate contracts to the test blockchain:

`` truffle migrate ``

Start the app:

`` npm run dev ``

## Issues

1. Even after updating the balance in the contract, a call to `` getBalance `` still returns the same result.  
This weird issue doesn't happen in the test, which makes it even weirder.

2. This project showcases just the basic functionality that I was able to learn from Truffle and IPFS. Currently  
taking an online course on Ethereum development and will be able to improve upon it.
