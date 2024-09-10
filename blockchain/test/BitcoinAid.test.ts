import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BitcoinAid", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("BitcoinAid");
    const contract = await Token.deploy();
    const tokenAddress = await contract.getAddress();

    return {
      owner,
      otherAccount,
      contract,
      tokenAddress,
    };
  }

  it("Should trasfer", async function () {
    const { owner, otherAccount, contract } = await loadFixture(deployFixture);

    expect(await contract.balanceOf(owner.address)).to.be.equal(
      ethers.parseUnits("2100000000", "ether")
    );
    await contract.transfer(
      otherAccount.address,
      ethers.parseUnits("2100000000", "ether")
    );
    expect(await contract.balanceOf(otherAccount.address)).to.be.equal(
      ethers.parseUnits("2079000000", "ether")
    );
    expect(await contract.balanceOf(owner.address)).to.be.equal(
      ethers.parseUnits("0", "ether")
    );
  });
  it("Should trasferFrom", async function () {
    const { owner, otherAccount, contract } = await loadFixture(deployFixture);

    expect(await contract.balanceOf(owner.address)).to.be.equal(
      ethers.parseUnits("2100000000", "ether")
    );
    await contract.approve(
      otherAccount.address,
      ethers.parseUnits("2100000000", "ether")
    );
    await contract
      .connect(otherAccount)
      .transferFrom(
        owner.address,
        otherAccount.address,
        ethers.parseUnits("2100000000", "ether")
      );
    expect(await contract.balanceOf(otherAccount.address)).to.be.equal(
      ethers.parseUnits("2079000000", "ether")
    );
    expect(await contract.balanceOf(owner.address)).to.be.equal(
      ethers.parseUnits("0", "ether")
    );
  });
});
