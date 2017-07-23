pragma solidity ^0.4.4;

contract Like {
    event Awarded(uint amount);

    struct User {
        uint balance;
        mapping(uint => string) content;
    }
    mapping(address => User) public userBase;

    function Like() public {
        userBase[msg.sender] = User(1000); 
    }

    function store_content(uint score, string hash) {
        userBase[msg.sender].content[score] = hash; // Store the hash content
    }

    function retrieve(uint score) public returns(string) {
        return userBase[msg.sender].content[score];
    }

    function award() {
        userBase[msg.sender].balance += 100;
        Awarded(100); // Fire this event to let the user know they've been awarded coins
    }

    function getBalance() public returns (uint) {
        return userBase[msg.sender].balance;
    }
}

