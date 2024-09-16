import { ethers } from "hardhat";

async function main() {
  // const BitcoinAid = await ethers.getContractFactory("BitcoinAid");
  // const btca = await BitcoinAid.deploy();
  // const btcaAddress = await btca.getAddress();
  // console.log(`btcaAddress deployed to ${btcaAddress}`);
  // const USDT = await ethers.getContractFactory("USDT");
  // const usdt = await USDT.deploy();
  // const usdtAddress = await usdt.getAddress();
  // console.log(`USDT deployed to ${usdtAddress}`);
  // const PaymentManager = await ethers.getContractFactory("PaymentManager");
  // const paymentManager = await PaymentManager.deploy(
  //   "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
  //   "0x1dD0dedBf32825652337F6BB7a3B3b4776547572"
  // );
  // const paymentManagerAddress = await paymentManager.getAddress();
  // console.log(`PaymentManager deployed to ${paymentManagerAddress}`);
  // const UniswapOracle = await ethers.getContractFactory("UniswapOracle");
  // const uniswapOracle = await UniswapOracle.deploy();
  // const uniswapOracleAddress = await uniswapOracle.getAddress();
  // console.log(`Oracle deployed to ${uniswapOracleAddress}`);

  // const Token = await ethers.getContractFactory("USDT");
  // const token = await Token.deploy();
  // const tokenAddress = await token.getAddress();
  // console.log(`USDT deployed to ${tokenAddress}`);

  // const BTCACollection = await ethers.getContractFactory("BTCACollection");
  // const collection = await BTCACollection.deploy(
  //   "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
  //   "0xCC09Bb34e14A0746be29b8e3419f9478E555a0A6"
  // );
  // const collectionAddress = await collection.getAddress();
  // console.log(`collection deployed to ${collectionAddress}`);

  const Queue = await ethers.getContractFactory("QueueDistribution");
  const queue = await Queue.deploy(
    "0xDFB4b3052BA55e6f682D10AD3A75453fc8a36425",
    "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
    "0x5873Df37e0d8Fc61cB1B917cBdAfD2A24428cC9F",
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572"
  );
  const queueAddress = await queue.getAddress();
  console.log(`queue deployed to ${queueAddress}`);

  // const Donation = await ethers.getContractFactory("DonationBTCA");
  // const donation = await Donation.deploy(
  //   "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
  //   "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
  //   "0xc248414C2321D0A17c3386d69F2777015Afd5417",
  //   "0x5873Df37e0d8Fc61cB1B917cBdAfD2A24428cC9F",
  //   queueAddress
  // );
  // const donationAddress = await donation.getAddress();
  // console.log(`donationAddress deployed to ${donationAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
