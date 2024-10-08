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

    const Btca = await ethers.getContractFactory("BitcoinAid");
    const btca = await Btca.deploy();
    const btcaAddress = await btca.getAddress();

    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(
      tokenAddress,
      owner.address
    );
    const paymentManagerAddress = await paymentManager.getAddress();
    const ReserveBTCA = await ethers.getContractFactory("ReserveBTCA");
    const reserveBtca = await ReserveBTCA.deploy(tokenAddress, owner.address);
    const resveBtcaAddress = await reserveBtca.getAddress();
    const ReservePools = await ethers.getContractFactory("ReservePools");
    const reservePools = await ReservePools.deploy(tokenAddress, owner.address);
    const reservePoolsAddress = await reservePools.getAddress();

    const BTCACollection = await ethers.getContractFactory("BTCACollection");
    const collection = await BTCACollection.deploy(
      owner.address,
      tokenAddress,
      paymentManagerAddress
    );
    await collection.startSale();
    const collectionAddress = await collection.getAddress();
    await collection.setReserveBtca(resveBtcaAddress);
    await collection.setReservePools(reservePoolsAddress);
    await paymentManager.setCollection(collectionAddress);
    await reserveBtca.setCollection(collectionAddress);
    await reservePools.setCollection(collectionAddress);

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
      btcaAddress,
      tokenAddress
    );

    const MultiCallLayer = await ethers.getContractFactory("MultiCallLayer");
    const multiCalllayer = await MultiCallLayer.deploy();
    await multiCalllayer.setMulticallAddress(await multicall.getAddress());

    await multicall.setLayer(await multiCalllayer.getAddress());
    await multicall.setApprovalForAll();
    await queue.setDonationContract(owner.address);

    await token.mint(10000 * 10 ** 6);
    await token.approve(collectionAddress, 10000 * 10 ** 6);
    for (let index = 0; index < 50; index++) {
      await collection.mint();
    }
    await collection.setApprovalForAll(queueAddress, true);

    await token.connect(otherAccount).mint(10000 * 10 ** 6);
    await token
      .connect(otherAccount)
      .approve(collectionAddress, 10000 * 10 ** 6);
    for (let index = 0; index < 49; index++) {
      await collection.connect(otherAccount).mint();
    }
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
      multicall,
    };
  }

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
      multicall,
    } = await loadFixture(deployFixture);
    await btca.transfer(
      queueAddress,
      ethers.parseUnits("10000000000", "ether")
    );
    await queue.incrementBalance(ethers.parseUnits("10000000000", "ether"));
    await queue.addToQueue(1);
    await queue.addToQueue(1);
    await queue.addToQueue(1);
    await queue.addToQueue(1);
    await queue.addToQueue(1);

    await collection.mint();
    await queue.addToQueue(1);
    await queue.addToQueue(1);

    await queue.addToQueue(1);
    for (let index = 0; index < 99; index++) {
      await collection.mint();
      await queue.addToQueue(2);
    }
    for (let index = 0; index < 101; index++) {
      await collection.mint();
    }
    await queue.addToQueue(2);
    await collection.setApprovalForAll(await multicall.getAddress(), true);
    for (let index = 0; index < 8; index++) {
      await multicall.depositNFT(1);
    }
    console.log(await collection.balanceOf(await multicall.getAddress(), 1));
    await multicall.multicall2();
    console.log(await collection.balanceOf(await multicall.getAddress(), 1));
    console.log((await queue.getQueueDetails(1)).length);
    console.log((await queue.getQueueDetails(2)).length);
    console.log((await queue.getQueueDetails(3)).length);
    console.log((await queue.getQueueDetails(4)).length);
  });
});

//6
//101
