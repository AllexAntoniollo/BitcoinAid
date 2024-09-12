import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { Log } from "ethers";
import { ethers } from "hardhat";

describe("Queue Distribution", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("USDT");
    const token = await Token.deploy();
    const tokenAddress = await token.getAddress();

    const BTCACollection = await ethers.getContractFactory("BTCACollection");
    const collection = await BTCACollection.deploy(owner.address, tokenAddress);
    const collectionAddress = await collection.getAddress();

    const Queue = await ethers.getContractFactory("QueueDistribution");
    const queue = await Queue.deploy(collectionAddress);
    const queueAddress = await queue.getAddress();

    await token.mint(1000 * 10 ** 6);
    await token.approve(collectionAddress, 1000 * 10 ** 6);
    await collection.mint(10);
    await collection.setApprovalForAll(queueAddress, true);

    await token.connect(otherAccount).mint(1000 * 10 ** 6);
    await token
      .connect(otherAccount)
      .approve(collectionAddress, 1000 * 10 ** 6);
    await collection.connect(otherAccount).mint(10);
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
    };
  }

  // Função para imprimir a fila de maneira organizada
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

  it("Should add queue", async function () {
    const {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
      queue,
      queueAddress,
    } = await loadFixture(deployFixture);

    await queue.addToQueue(1, 1);
    await queue.addToQueue(1, 1);
    await queue.addToQueue(1, 1);
    await queue.addToQueue(1, 1);

    let queueDetails = await queue.getQueueDetails();

    await queue.removeFromQueue(1);
    queueDetails = await queue.getQueueDetails();

    await queue.connect(otherAccount).addToQueue(1, 1);
    queueDetails = await queue.getQueueDetails();

    await queue.removeFromQueue(3);
    queueDetails = await queue.getQueueDetails();

    await queue.addToQueue(1, 1);
    queueDetails = await queue.getQueueDetails();
    printQueueDetails(queueDetails);
    await queue.removeFromQueue(6);
    console.log(await queue.getQueueDetails());
  });
});
