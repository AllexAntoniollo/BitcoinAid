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
      uniswapOracleAddress,
      owner.address
    );
    const queueAddress = await queue.getAddress();

    const MultiCall = await ethers.getContractFactory("MultiCall");
    const multicall = await MultiCall.deploy(
      owner.address,
      collectionAddress,
      queueAddress,
      btcaAddress
    );
    await multicall.setApprovalForAll();
    await queue.setDonationContract(owner.address);

    await token.mint(10000 * 10 ** 6);
    await token.approve(collectionAddress, 10000 * 10 ** 6);
    await collection.mint(50);
    await collection.setApprovalForAll(queueAddress, true);

    await token.connect(otherAccount).mint(10000 * 10 ** 6);
    await token
      .connect(otherAccount)
      .approve(collectionAddress, 10000 * 10 ** 6);
    await collection.connect(otherAccount).mint(49);
    await collection
      .connect(otherAccount)
      .setApprovalForAll(queueAddress, true);
    await collection.setApprovalForAll(await multicall.getAddress(), true);
    return {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
      btca,
      multicall,
    };
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
      multicall,
    } = await loadFixture(deployFixture);
    await btca.transfer(queueAddress, ethers.parseUnits("150", "ether"));
    await queue.incrementBalance(ethers.parseUnits("148.5", "ether"));
    await queue.addToQueue(1);
    await queue.addToQueue(1);

    await multicall.depositNFT(1);
    await multicall.depositNFT(1);

    await multicall.multiCall();

    console.log(await btca.balanceOf(await multicall.getAddress()));
  });
});
