pragma solidity ^0.4.4;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Like.sol";

contract TestLike {
    function testInit() {
        Like like = new Like();

        uint currentBalance = like.getBalance();
        Assert.equal(currentBalance, 1000, "Balance should be incremented.");
    }

    function testAwarded() {
        Like like = new Like();

        like.award();
        uint currentBalance = like.getBalance();
        Assert.equal(currentBalance, 1100, "Balance should be incremented.");
    }
}