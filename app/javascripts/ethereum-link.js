// Import the page's CSS. Webpack will know what to do with it.
import { default as Web3} from 'web3';
import { default as TruffleContract } from 'truffle-contract';
import like_artifacts from '../../build/contracts/Like.json'
import { default as IPFSUploader } from 'ipfs-image-web-upload';

var content_hash = [];
var Like = TruffleContract(like_artifacts)
const IPFS = require('ipfs')
var ipfs = new IPFS({
  repo: 'ipfs/yjs-demo/' + Math.random(),
  EXPERIMENTAL: {
    pubsub: true
  }
})

ipfs.once('ready', () => ipfs.id((err, info) => {
  if (err) { throw err }
  console.log('IPFS node ready with address ' + info.id)
}))

var uploader = new IPFSUploader(ipfs);

export function initWeb3() {
    // Initialize web3
    if (typeof web3 !== 'undefined') {
      console.warn("Using web3 detected from external source like Metamask")
      window.web3 = new Web3(web3.currentProvider);
    } else {
      window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    Like.setProvider(web3.currentProvider);
    console.log("web3 and contract loaded successfully");

    Like.deployed().then(function(instance) {
      var Awarded = instance.Awarded({fromBlock : "latest"})
      Awarded.watch(function(err, result) {
        console.log('Amount awarded is', result.args.amount.valueOf())
      })
    })
    console.log("Watcher instantiated")
}

export function addToIPFS(score, blob) {
  uploader.uploadBlob(blob).then(hash => {
    web3.eth.getAccounts(function(err, accounts) {
      if (err) console.log(err.message)

      Like.deployed().then(function(instance) {
        console.log("HASH STORE IS", hash)
        instance.store_content(score, hash, {from : accounts[0]})

        console.log("Award the user") 
        instance.award({from : accounts[0]})
      })
    })
  })
}

export function testEvent() {
  web3.eth.getAccounts(function(err, accounts) {
    Like.deployed().then(function(instance) {
      instance.award({from : accounts[0]})
    })
  })
}

export function getImage(score, img_tag) {
  // Retrieve hash from Ethereum contract
  web3.eth.getAccounts(function(err, accounts) {
    if (err) console.assert(err.message)    
    
    Like.deployed().then(function(instance) {
      return instance.retrieve.call(score).valueOf()
    }).then(function(result) {
      console.log("HASH RETRIEVE IS", result)
      uploader.loadImage(img_tag, result)
    })
  })
}

export function showBalance(callback) {
  Like.deployed().then(function(instance) {
    return instance.getBalance.call();
  }).then(function(result) {
    callback(result.valueOf())
  }).catch(function(err) {
    console.log(err.message);
  });
}
