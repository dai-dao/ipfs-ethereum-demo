## Demo app using Ethereum / Truffle / IPFS 
User can upload a photo, store it in IPFS and receive some funds if the content gets likes.  
The contract is used to manage users and hash content.

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
