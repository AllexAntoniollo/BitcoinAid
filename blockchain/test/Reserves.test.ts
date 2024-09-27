import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Payment Manager", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Usdt = await ethers.getContractFactory("USDT");
    const usdt = await Usdt.deploy();
    const usdtAddress = await usdt.getAddress();
    const Token = await ethers.getContractFactory("BitcoinAid");
    const token = await Token.deploy();
    const tokenAddress = await token.getAddress();

    const ReserveBTCA = await ethers.getContractFactory("ReserveBTCA");
    const reserveBtca = await ReserveBTCA.deploy(
      usdtAddress,
      tokenAddress,
      owner.address
    );
    const ReservePools = await ethers.getContractFactory("ReservePools");
    const reservePools = await ReservePools.deploy(usdtAddress, owner.address);
    const reservePoolsAddress = await reservePools.getAddress();

    const reserveBtcaAddress = await reserveBtca.getAddress();
    await reserveBtca.setCollection(owner.address);
    return {
      owner,
      otherAccount,
      token,
      reserveBtca,
      reserveBtcaAddress,
      usdt,
      reservePools,
      reservePoolsAddress,
    };
  }

  it("Should claim btca reserve", async function () {
    const {
      owner,
      otherAccount,

      token,
      reserveBtca,
      reserveBtcaAddress,
    } = await loadFixture(deployFixture);
    await reserveBtca.incrementBalance(ethers.parseUnits("100", "ether"));
    expect(await reserveBtca.virtualBalance()).to.be.equal(
      ethers.parseUnits("100", "ether")
    );
    await reserveBtca.setClaimWallet(otherAccount.address);
    await token.transfer(reserveBtcaAddress, ethers.parseUnits("100", "ether"));
    await reserveBtca.connect(otherAccount).collectBTCA();
    expect(await token.balanceOf(otherAccount.address)).to.be.equal(
      ethers.parseUnits("98.01", "ether")
    );
  });
  it("Should claim usdt reserve", async function () {
    const {
      owner,
      otherAccount,

      usdt,
      reservePools,
      reservePoolsAddress,
    } = await loadFixture(deployFixture);
    await usdt.mint(100 * 10 ** 6);
    await usdt.transfer(reservePoolsAddress, 100 * 10 ** 6);
    await reservePools.setCollection(owner.address);
    await reservePools.incrementBalance(100 * 10 ** 6);
    await reservePools.setClaimWallet(otherAccount.address);
    await reservePools.connect(otherAccount).collect(50 * 10 ** 6);
  });
});
