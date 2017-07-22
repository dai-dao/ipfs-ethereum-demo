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

1. Since this is just a demo app, reviewers are encouraged to open the log console on the web page to really see what's going on under the hood.

2. After updating the balance in the contract through ``award()``, a call to ``getBalance`` still returns the same result.  
The test passes however which makes this confusing to debug.

3. This project showcases just the basic functionality that I was able to learn from Truffle and IPFS. Currently  
taking an online course on Ethereum development and will be able to improve upon it.
