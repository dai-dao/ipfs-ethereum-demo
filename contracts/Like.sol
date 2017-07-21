pragma solidity ^0.4.4;

contract Like {
    address user;
    mapping(address => uint256) balanceOf;
    bytes32[5] public user_content_hash;

    function Like() public {
        user = msg.sender; 
        balanceOf[user] = 1000; /* Initial coin amount in the user wallet */
    }

    function store_content(uint id, bytes32 hash) {
        user_content_hash[id] = hash; /* Store the content hash in the contract */
    }

    function award() {
        balanceOf[user] += 10;  
    }

    function getBalance() public returns (uint256) {
        return balanceOf[user];
    }
}

