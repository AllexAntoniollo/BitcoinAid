import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Queue Distribution", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("USDT");
    const token = await Token.deploy();
    const tokenAddress = await token.getAddress();

    const BTCA = await ethers.getContractFactory("BitcoinAid");
    const btca = await BTCA.deploy();
    const btcaAddress = await btca.getAddress();

    const BTCACollection = await ethers.getContractFactory("BTCACollection");
    const collection = await BTCACollection.deploy(owner.address, tokenAddress);
    const collectionAddress = await collection.getAddress();

    const UniswapOracle = await ethers.getContractFactory("UniswapOracle");
    const uniswapOracle = await UniswapOracle.deploy();
    const uniswapOracleAddress = await uniswapOracle.getAddress();

    const Queue = await ethers.getContractFactory("QueueDistribution");
    const queue = await Queue.deploy(
      collectionAddress,
      btcaAddress,
      uniswapOracleAddress
    );
    const queueAddress = await queue.getAddress();

    await token.mint(1000 * 10 ** 6);
    await token.approve(collectionAddress, 1000 * 10 ** 6);
    await collection.mint(50);
    await collection.setApprovalForAll(queueAddress, true);

    await token.connect(otherAccount).mint(1000 * 10 ** 6);
    await token
      .connect(otherAccount)
      .approve(collectionAddress, 1000 * 10 ** 6);
    await collection.connect(otherAccount).mint(49);
    await collection
      .connect(otherAccount)
      .setApprovalForAll(queueAddress, true);

    return {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
      btca,
    };
  }

  function printQueueDetails(queueDetails: any[]) {
    console.log("Current Queue:");
    if (queueDetails.length === 0) {
      console.log("The queue is empty.");
    } else {
      queueDetails.forEach((entry, index) => {
        console.log(`Position ${index + 1}:`);
        console.log(`  User: ${entry.user}`);
        console.log(`  Index: ${entry.index}`);
        console.log(`  Next: ${entry.next}`);
        console.log(`  Prev: ${entry.prev}`);
        console.log("----------------------------");
      });
    }
  }

  it("Should claim with 6 first index", async function () {
    const {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
      btca,
    } = await loadFixture(deployFixture);
    await btca.transfer(queueAddress, ethers.parseUnits("150", "ether"));
    await queue.incrementBalance(ethers.parseUnits("148.5", "ether"));
    await queue.addToQueue(1);
    await queue.addToQueue(1);
    await queue.connect(otherAccount).addToQueue(1);
    await queue.connect(otherAccount).addToQueue(1);
    await queue.addToQueue(1);
    await queue.connect(otherAccount).addToQueue(1);
    expect(await queue.queueSizeByBatch(1)).to.be.equal(6);
    const balance = await btca.balanceOf(owner.address);

    await queue.claim(1, 1);

    expect(await btca.balanceOf(owner.address)).to.be.within(
      balance + ethers.parseUnits("99", "ether") - 10n,
      balance + ethers.parseUnits("99", "ether") + 10n
    );
    expect(await queue.queueSizeByBatch(1)).to.be.equal(2);
    expect(await queue.tokensToWithdraw(otherAccount.address)).to.be.equal(
      ethers.parseUnits("33.333333333333333333", "ether")
    );
  });
  it("Should claim with 4", async function () {
    const {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
      btca,
    } = await loadFixture(deployFixture);
    await btca.transfer(queueAddress, ethers.parseUnits("150", "ether"));
    await queue.incrementBalance(ethers.parseUnits("148.5", "ether"));
    await queue.addToQueue(1);
    await queue.addToQueue(1);
    await queue.connect(otherAccount).addToQueue(1);
    await queue.connect(otherAccount).addToQueue(1);

    expect(await queue.queueSizeByBatch(1)).to.be.equal(4);
    const balance = await btca.balanceOf(owner.address);

    await queue.claim(1, 1);

    expect(await btca.balanceOf(owner.address)).to.be.within(
      balance + ethers.parseUnits("66", "ether") - 10n,
      balance + ethers.parseUnits("66", "ether") + 10n
    );
    expect(await queue.queueSizeByBatch(1)).to.be.equal(0);
    expect(await queue.tokensToWithdraw(otherAccount.address)).to.be.equal(
      ethers.parseUnits("66.666666666666666666", "ether")
    );
    await btca.transfer(queueAddress, ethers.parseUnits("150", "ether"));
    await queue.incrementBalance(ethers.parseUnits("148.5", "ether"));
    await queue.addToQueue(1);
    await queue.addToQueue(1);
    await queue.connect(otherAccount).addToQueue(1);
    await queue.connect(otherAccount).addToQueue(1);

    expect(await queue.queueSizeByBatch(1)).to.be.equal(4);
    const balance2 = await btca.balanceOf(owner.address);

    await queue.claim(5, 1);

    expect(await btca.balanceOf(owner.address)).to.be.within(
      balance2 + ethers.parseUnits("66", "ether") - 10n,
      balance2 + ethers.parseUnits("66", "ether") + 10n
    );
    expect(await queue.queueSizeByBatch(1)).to.be.equal(0);
    expect(await queue.tokensToWithdraw(otherAccount.address)).to.be.equal(
      ethers.parseUnits("66.666666666666666666", "ether") * 2n
    );
    await queue.connect(otherAccount).withdrawTokens();
    expect(await btca.balanceOf(otherAccount.address)).to.be.equal(
      ethers.parseUnits("131.999999999999999999", "ether")
    );
  });
  it("Should claim with 30", async function () {
    const {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
      btca,
    } = await loadFixture(deployFixture);
    await btca.transfer(queueAddress, ethers.parseUnits("1500", "ether"));
    await queue.incrementBalance(ethers.parseUnits("1485", "ether"));
    for (let index = 0; index < 15; index++) {
      await queue.addToQueue(1);
    }
    for (let index = 0; index < 15; index++) {
      await queue.connect(otherAccount).addToQueue(1);
    }
    await queue.connect(otherAccount).claim(28, 1);
    expect(await queue.queueSizeByBatch(1)).to.be.equal(22);
    expect(await btca.balanceOf(otherAccount.address)).to.be.equal(
      ethers.parseUnits("131.999999999999999999", "ether")
    );
    expect(await queue.tokensToWithdraw(owner.address)).to.be.equal(
      ethers.parseUnits("133.333333333333333332", "ether")
    );

    expect(await queue.balanceFree()).that.be.equal(
      ethers.parseUnits("1218.333333333333333336", "ether")
    );
  });
  it("Should claim with 100", async function () {
    const {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
      btca,
    } = await loadFixture(deployFixture);
    await btca.transfer(queueAddress, ethers.parseUnits("7000", "ether"));
    await queue.incrementBalance(ethers.parseUnits("6930", "ether"));
    for (let index = 0; index < 25; index++) {
      await queue.addToQueue(1);
    }
    for (let index = 0; index < 25; index++) {
      await queue.connect(otherAccount).addToQueue(1);
    }
    await collection.connect(otherAccount).mint(1);
    for (let index = 0; index < 25; index++) {
      await queue.addToQueue(1);
    }
    for (let index = 0; index < 25; index++) {
      await queue.connect(otherAccount).addToQueue(1);
    }
    const balance = await btca.balanceOf(owner.address);
    await queue.claim(51, 2);
    console.log(await queue.getQueueDetails(2));

    // expect((await btca.balanceOf(owner.address)) - balance).to.be.equal(
    //   ethers.parseUnits("956.999999999999999991", "ether")
    // );
    // console.log(await queue.tokensToWithdraw(otherAccount.address));
    // await queue.claim(53, 2);
    // console.log(await queue.tokensToWithdraw(otherAccount.address));
  });
  it("Should not claim with 3", async function () {
    const {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
      btca,
    } = await loadFixture(deployFixture);
    await btca.transfer(queueAddress, ethers.parseUnits("250", "ether"));
    await queue.incrementBalance(ethers.parseUnits("247.5", "ether"));
    for (let index = 0; index < 5; index++) {
      await queue.connect(otherAccount).addToQueue(1);
    }

    await queue.connect(otherAccount).claim(5, 1);
  });
});
