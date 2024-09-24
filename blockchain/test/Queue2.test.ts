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
    const reserveBtca = await ReserveBTCA.deploy(
      tokenAddress,
      btcaAddress,
      owner.address
    );
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
      btcaAddress
    );
    await multicall.setApprovalForAll();
    await queue.setDonationContract(owner.address);

    await token.mint(10000 * 10 ** 6);
    await token.approve(collectionAddress, 10000 * 10 ** 6);
    await collection.mint(10);
    await collection.setApprovalForAll(queueAddress, true);

    await token.connect(otherAccount).mint(10000 * 10 ** 6);
    await token
      .connect(otherAccount)
      .approve(collectionAddress, 100000 * 10 ** 6);
    await collection.connect(otherAccount).mint(90);

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
    await btca.transfer(queueAddress, ethers.parseUnits("100000000", "ether"));
    await queue.incrementBalance(ethers.parseUnits("990000000", "ether"));

    //FILA 1
    for (let index = 0; index < 90; index++) {
      await queue.connect(otherAccount).addToQueue(1);
    }
    await collection.connect(otherAccount).mint(100);
    for (let index = 0; index < 30; index++) {
      await queue.connect(otherAccount).addToQueue(2);
    }
    console.log("Size Queue2: ", (await queue.getQueueDetails(2)).length);

    console.log("Size Queue3: ", (await queue.getQueueDetails(3)).length);
    await collection.connect(otherAccount).mint(100);

    for (let index = 0; index < 10; index++) {
      await multicall.depositNFT(1);
    }

    for (let index = 1; index <= 11; index++) {
      try {
        await multicall.multiCall();
      } catch (error: any) {
        console.log(error.message);
        await queue.connect(otherAccount).claim(index * 4, 2);
      }
    }
    await queue.connect(otherAccount).claim(46, 2);
    for (let index = 23; index <= 26; index++) {
      try {
        await multicall.multiCall();
      } catch (error: any) {
        console.log(error.message);
        await queue.connect(otherAccount).claim(index * 4, 3);
      }
    }
    console.log(await queue.getRequiredBalanceForNextFour());

    await multicall.multiCall();
    await multicall.multiCall();
    await multicall.multiCall();

    console.log("Size Queue2: ", (await queue.getQueueDetails(2)).length);
    console.log("Size Queue3: ", (await queue.getQueueDetails(3)).length);
    console.log("Size Queue4: ", (await queue.getQueueDetails(4)).length);

    console.log(
      "Bot balance: ",
      ethers.formatEther(await btca.balanceOf(await multicall.getAddress()))
    );
  });
});
