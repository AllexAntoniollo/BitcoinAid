import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Presale", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const USDT = await ethers.getContractFactory("USDT");
    const usdt = await USDT.deploy();
    const usdtAddress = await usdt.getAddress();
    const BTCA = await ethers.getContractFactory("BitcoinAid");
    const btca = await BTCA.deploy();
    const btcaAddress = await btca.getAddress();

    const Presale = await ethers.getContractFactory("Presale");
    const contract = await Presale.deploy(
      usdtAddress,
      btcaAddress,
      owner.address
    );
    const PresaleAddress = await contract.getAddress();

    return {
      owner,
      otherAccount,
      contract,
      PresaleAddress,
      usdt,
      btca,
    };
  }

  it("Should start presale", async function () {
    const { owner, otherAccount, contract, usdt, PresaleAddress, btca } =
      await loadFixture(deployFixture);

    await usdt.mint(400 * 10 ** 6);
    await usdt.approve(PresaleAddress, 400 * 10 ** 6);
    await expect(contract.purchaseAllocation()).to.be.revertedWith(
      "Sale has not started."
    );
    await btca.approve(PresaleAddress, ethers.parseUnits("110000", "ether"));
    await contract.depositBtca(ethers.parseUnits("110000", "ether"));
    await contract.startSale();

    await contract.purchaseAllocation();
    expect(await contract.hasAllocation(owner.address)).to.be.equal(true);
    await expect(contract.purchaseAllocation()).to.be.revertedWith(
      "Already has an allocation."
    );
    await usdt.connect(otherAccount).mint(400 * 10 ** 6);
    await usdt.connect(otherAccount).approve(PresaleAddress, 400 * 10 ** 6);
    await contract.connect(otherAccount).purchaseAllocation();
    expect(await contract.totalAllocations()).to.be.equal(2);
    await expect(contract.endSale()).to.be.revertedWith(
      "Sale duration not ended."
    );

    await time.increase(24 * 60 * 60);

    await expect(contract.claimBtca()).to.be.revertedWith(
      "Owner has not finalized the sale."
    );
    await contract.endSale();
    await contract.connect(otherAccount).claimBtca();
    expect(await btca.balanceOf(otherAccount.address)).to.be.equal(
      ethers.parseUnits("55000", "ether")
    );
    const balance = await btca.balanceOf(owner.address);
    await contract.claimBtca();
    expect(await btca.balanceOf(owner.address)).to.be.equal(
      ethers.parseUnits("55000", "ether") + balance
    );
  });
  it("Should not buy sale ended", async function () {
    const { owner, otherAccount, contract, usdt, PresaleAddress } =
      await loadFixture(deployFixture);

    await usdt.mint(400 * 10 ** 6);
    await usdt.approve(PresaleAddress, 400 * 10 ** 6);

    await contract.startSale();
    await time.increase(24 * 60 * 60);

    await expect(contract.purchaseAllocation()).to.be.revertedWith(
      "Sale has ended."
    );
  });
});
