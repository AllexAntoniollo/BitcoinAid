import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { Log } from "ethers";
import { ethers } from "hardhat";

describe("BTCA Collection", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("USDT");
    const token = await Token.deploy();
    const tokenAddress = await token.getAddress();

    const BTCACollection = await ethers.getContractFactory("BTCACollection");
    const collection = await BTCACollection.deploy(owner.address, tokenAddress);
    const collectionAddress = await collection.getAddress();

    await token.mint(1000 * 10 ** 6);
    await token.approve(collectionAddress, 1000 * 10 ** 6);

    return {
      owner,
      otherAccount,
      token,
      collection,
      collectionAddress,
    };
  }

  it("Should mint nft", async function () {
    const { owner, otherAccount, token, collection, collectionAddress } =
      await loadFixture(deployFixture);
    await collection.mint(1);
    expect(await token.balanceOf(owner.address)).to.be.equal(990 * 10 ** 6);
    expect(await collection.balanceOf(owner.address, 1)).to.be.equal(1);
    await collection.mint(10);
    expect(await token.balanceOf(owner.address)).to.be.equal(890 * 10 ** 6);
    expect(await collection.balanceOf(owner.address, 1)).to.be.equal(11);
  });
  it("Should not mint nft exceeds max limit", async function () {
    const { owner, otherAccount, token, collection, collectionAddress } =
      await loadFixture(deployFixture);
    await expect(collection.mint(101)).to.be.revertedWith(
      "The batch limit was reached"
    );
  });
  it("Should set URI", async function () {
    const { owner, otherAccount, token, collection, collectionAddress } =
      await loadFixture(deployFixture);

    await collection.setURI("ipfs://");
  });
  it("Should mint NFTs in subsequent batches with correct prices", async function () {
    const { owner, token, collection, collectionAddress } = await loadFixture(
      deployFixture
    );

    await token.mint(ethers.parseUnits("100000000", "ether"));
    await token.approve(
      collectionAddress,
      ethers.parseUnits("100000000", "ether")
    );

    async function getBatchPrice() {
      return await collection.getCurrentBatchPrice();
    }

    for (let batch = 1; batch <= 40; batch++) {
      const price = await getBatchPrice();

      const amount = 100;
      const totalPrice = price * BigInt(amount) * BigInt(10 ** 6);

      await collection.mint(100);

      expect(await collection.balanceOf(owner.address, batch)).to.be.equal(
        amount
      );
      expect(await collection.currentBatch()).to.be.equal(batch + 1);
    }
  });
});