import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Payment Manager", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("BitcoinAid");
    const token = await Token.deploy();
    const tokenAddress = await token.getAddress();

    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(
      tokenAddress,
      owner.address
    );
    const paymentManagerAddress = await paymentManager.getAddress();

    return {
      owner,
      otherAccount,
      token,
      paymentManager,
      paymentManagerAddress,
    };
  }

  it("Should set donation", async function () {
    const {
      owner,
      otherAccount,

      token,
      paymentManager,
    } = await loadFixture(deployFixture);
    await paymentManager.setDonation(owner.address);
    expect(await paymentManager.donationContract()).to.be.equal(owner.address);
  });
  it("Should get recipients", async function () {
    const {
      owner,
      otherAccount,

      token,
      paymentManager,
    } = await loadFixture(deployFixture);
    expect((await paymentManager.getRecipients()).length).to.be.equal(5);
  });
  it("Should increment balance and claim", async function () {
    const {
      owner,
      otherAccount,

      token,
      paymentManager,
      paymentManagerAddress,
    } = await loadFixture(deployFixture);
    await paymentManager.setDonation(owner.address);
    await token.transfer(paymentManagerAddress, 101.010101 * 10 ** 6);
    await paymentManager.incrementBalance(100 * 10 ** 6);

    expect(await paymentManager.balanceFree()).to.be.equal(100 * 10 ** 6);
    const recipients = await paymentManager.getRecipients();
    for (let index = 0; index < 5; index++) {
      expect(
        await paymentManager.getUserBalance(recipients[index])
      ).to.be.equal(20 * 10 ** 6);
    }
    expect(await token.balanceOf(paymentManagerAddress)).to.be.within(
      100 * 10 ** 6 - 30,
      100 * 10 ** 6 + 30
    );
    const balance = await token.balanceOf(owner.address);
    await paymentManager.claim();
    expect(await token.balanceOf(owner)).to.be.equal(
      balance + BigInt(19.8 * 10 ** 6)
    );
    for (let index = 0; index < 4; index++) {
      expect(
        await paymentManager.getUserBalance(recipients[index])
      ).to.be.equal(20 * 10 ** 6);
    }
    expect(await paymentManager.getUserBalance(recipients[4])).to.be.equal(0);
    expect(
      await paymentManager.getUserBalance(otherAccount.address)
    ).to.be.equal(0);
  });
  it("Should increment balance and claim another address", async function () {
    const {
      owner,
      otherAccount,

      token,
      paymentManager,
      paymentManagerAddress,
    } = await loadFixture(deployFixture);
    await paymentManager.setDonation(owner.address);
    await token.transfer(paymentManagerAddress, 101.010101 * 10 ** 6);
    await paymentManager.incrementBalance(100 * 10 ** 6);

    await paymentManager.updateRecipientPercentage(
      "0x1111111111111111111111111111111111111111",
      0
    );
    expect(await paymentManager.totalPercentage()).to.be.equal(800000);
    await paymentManager.addRecipient(otherAccount.address, 200000);
    expect(await paymentManager.totalPercentage()).to.be.equal(1000000);
    expect(
      await paymentManager.recipientsPercentage(otherAccount.address)
    ).to.be.equal(200000);

    await paymentManager.connect(otherAccount).claim();
  });
  it("Should not increment ", async function () {
    const {
      owner,
      otherAccount,

      token,
      paymentManager,
      paymentManagerAddress,
    } = await loadFixture(deployFixture);
    await expect(paymentManager.incrementBalance(100)).to.be.revertedWith(
      "Only the donation contract or collection contract can call this function."
    );
  });
  it("Should not claim (not recipient)", async function () {
    const {
      owner,
      otherAccount,

      token,
      paymentManager,
      paymentManagerAddress,
    } = await loadFixture(deployFixture);
    await paymentManager.setDonation(owner.address);
    await paymentManager.incrementBalance(100 * 10 ** 6);

    await expect(
      paymentManager.connect(otherAccount).claim()
    ).to.be.revertedWith("You are not a registered recipient");
  });
});
