import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
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
});
