import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Like.sol";

contract TestLike {
    Like like = Like(DeployedAddresses.Like());

    function testAward() {
        like.award();
        uint256 currentBalance = like.getBalance();
        Assert.equal(currentBalance, 1010, "Balance should be incremented.");
    }
}