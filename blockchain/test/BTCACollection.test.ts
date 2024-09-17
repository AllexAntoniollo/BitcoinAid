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
