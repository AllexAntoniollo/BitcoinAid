import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tournament", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Usdt = await ethers.getContractFactory("USDT");
    const usdt = await Usdt.deploy();
    const usdtAddress = await usdt.getAddress();

    const Tournament = await ethers.getContractFactory("Tournament");
    const tournament = await Tournament.deploy(owner.address, usdtAddress);
    const tournamentAddress = await tournament.getAddress();

    await usdt.mint(1000 * 10 ** 6);
    await usdt.approve(tournamentAddress, 1000 * 10 ** 6);

    return {
      owner,
      otherAccount,
      tournamentAddress,
      tournament,
      usdt,
    };
  }

  it("Should tournament", async function () {
    const { owner, otherAccount, tournamentAddress, tournament, usdt } =
      await loadFixture(deployFixture);
    await tournament.deposit(1000 * 10 ** 6);
    expect(await tournament.balances()).to.deep.equal([
      BigInt(500 * 10 ** 6),
      BigInt(500 * 10 ** 6),
    ]);
    const wallets = [];

    for (let i = 0; i < 15; i++) {
      const wallet = ethers.Wallet.createRandom();
      if (i == 0) {
        wallets.push(otherAccount.address);
      } else if (i == 1) {
        wallets.push(owner.address);
      } else {
        wallets.push(wallet.address);
      }
    }

    await tournament.distributeFunds(wallets.slice(0, 5), 24);

    expect(await tournament.balances()).to.deep.equal([
      0,
      BigInt(500 * 10 ** 6),
    ]);
    await tournament.withdraw();
    expect(await usdt.balanceOf(owner.address)).to.be.equal(125000000);

    await time.increase(60 * 60 * 24 * 3);
    await expect(
      tournament.connect(otherAccount).withdraw()
    ).to.be.revertedWith("Withdrawal period expired");
    const expireds = await tournament.getExpiredUsers();
    for (let index = 0; index < expireds.length; index++) {
      await tournament.collectExpiredFunds(expireds[index]);
    }
  });
});
