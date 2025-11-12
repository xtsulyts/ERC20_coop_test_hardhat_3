// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { CooperadoraTest} from "./CooperadoraTest.t.sol";
import {Test} from "forge-std/Test.sol";

// Declarar los eventos que vas a usar en los tests
interface IERC20Events {
    event Transfer(address indexed from, address indexed to, uint256 value);
}


contract CooperadoraToken is ERC20, Ownable {
    constructor() ERC20("Cooperadora TOKEN", "COOP") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(amount > 0, "Amount must be greater than 0");
        return super.transfer(to, amount);
    }
}