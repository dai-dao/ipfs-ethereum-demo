// Specifically request an abstraction for MetaCoin
var Like = artifacts.require("Like");

contract("Like", function(accounts) {
    it("Should put 1000 value in the first account", function() {
        Like.deployed().then(function(instance) {
            return instance.getBalance.call();
        }).then(function(result) {
            assert.equal(result, 1000, "1000 wasn't in the first account" )
        })
    })

    it("Should award correctly", function() {
        Like.deployed().then(function(instance) {
            instance.award({from : accounts[0]}) // This is a transaction
            return instance
        }).then(function(instance) {
            return instance.getBalance.call()
        }).then(function(balance) {
            assert.equal(balance, 1100, "Balance wasn't incremented")
        })
    })

    it("Should fire event when rewarded, this is a known issue with Truffle", function() {
        var watcher = Like.Awarded

        Like.deployed().then(function(instance) {
            instance.award({from : accounts[0]}) // This is a transaction
        }).then(function() {
            return watcher.get()
        }).then(function(events){
            assert.equal(events.length, 1)
            assert.equal(events[0].args.amount, 100)
        })
    })

    it("Test retrieving hash content", function() {
        Like.deployed().then(function(instance) {
            instance.store_content(1, "hash1")
            instance.store_content(2, "hash2")
            return instance
        }).then(function(instance) {
            assert.equal(instance.retrieve.call(1).valueOf(), "hash1")
            assert.equal(instance.retrieve.call(2).valueOf(), "hash2")
        })
    })
})
