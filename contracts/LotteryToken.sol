// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract  LotteryToken is ERC20 {
    constructor() ERC20("LotteryToken", "LT") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}