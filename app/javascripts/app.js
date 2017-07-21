// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
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

$(document).ready(function(){
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
      return instance.award.call();
    }).then(function(result) {
      return window.showBalance();
    }).catch(function(err) {
      console.log('Error message', err.message);
    });

    $(":file").change(function () {
        if (this.files && this.files[0]) {
            // var reader = new FileReader();
            // reader.onload = window.imageIsLoaded;
            // reader.readAsDataURL(this.files[0]);
            // Add the hash to the contract

            addIPFS(this.files[0]).then(hash => {
              web3.eth.getAccounts(function(error, accounts) {
                if (error) {
                  console.log(error);
                }

                var account = accounts[0];
                var Id = 0;

                Like.deployed().then(function(instance) {
                  console.log("HASH IS", hash.toString());
                  instance.store_content(Id, hash.toString(), {from : account}); // Store hash in contract
                  console.log('Saved to contract');
                })  
              });

              // Reload image from IPFS
              console.log("Repload image from IPFS");
              var img_tag = document.querySelector( "#output" );
              uploader.loadImage(img_tag, hash);
            }) 
        }
    });
});

window.likeClick = function(val) {
  console.log("Like button clicked");

  Like.deployed().then(function(instance) {
    return instance.award.call();
  }).then(function() {
    return window.showBalance();
  }).catch(function(err) {
    console.log('Error message', err.message);
  });
}

window.imageIsLoaded = function(e) {
    $('#myImg').attr('src', e.target.result);
};

async function addIPFS(x) {
  // var file_input = document.getElementById("uploadedImage");
  return await uploader.uploadBlob(x);
}

window.showBalance = function() {
  Like.deployed().then(function(instance) {
    return instance.getBalance.call();
  }).then(function(result) {
    console.log("Current user balance is: ", result.c[0])
  }).catch(function(err) {
    console.log(err.message);
  });
}