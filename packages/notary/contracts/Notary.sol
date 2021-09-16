// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.4;

contract Notary {
    event NewMeterReading(address indexed operator, bytes32 indexed proof);

    function store(bytes32 proof) public {
        emit NewMeterReading(msg.sender, proof);
    }
}