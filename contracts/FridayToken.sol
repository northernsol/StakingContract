// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FridayToken is ERC20 {
    constructor() ERC20("FridayToken", "TGIF") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}
