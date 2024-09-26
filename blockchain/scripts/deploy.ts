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
  // const ReserveBTCA = await ethers.getContractFactory("ReserveBTCA");
  // const reserveBtca = await ReserveBTCA.deploy(
  //   "0xCC09Bb34e14A0746be29b8e3419f9478E555a0A6",
  //   "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
  //   "0x1dD0dedBf32825652337F6BB7a3B3b4776547572"
  // );
  // const reserveBtcaAddress = await reserveBtca.getAddress();
  // console.log(`reserveBtca deployed to ${reserveBtcaAddress}`);
  // const ReservePools = await ethers.getContractFactory("ReservePools");
  // const reservePools = await ReservePools.deploy(
  //   "0xCC09Bb34e14A0746be29b8e3419f9478E555a0A6",
  //   "0x1dD0dedBf32825652337F6BB7a3B3b4776547572"
  // );
  // const reservePoolsAddress = await reservePools.getAddress();
  // console.log(`reservePools deployed to ${reservePoolsAddress}`);
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
  //   "0xCC09Bb34e14A0746be29b8e3419f9478E555a0A6",
  //   "0x09E30223c4bb6FfAD7A0dbca704C55608e00077B"
  // );
  // const collectionAddress = await collection.getAddress();
  // console.log(`collection deployed to ${collectionAddress}`);
  const Queue = await ethers.getContractFactory("QueueDistribution");
  const queue = await Queue.deploy(
    "0x7CB482133f3364DF2aC3998E7B33b066E3580129",
    "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
    "0x5873Df37e0d8Fc61cB1B917cBdAfD2A24428cC9F",
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572"
  );
  const queueAddress = await queue.getAddress();
  console.log(`queue deployed to ${queueAddress}`);
  // const MultiCall = await ethers.getContractFactory("MultiCall");
  // const multicall = await MultiCall.deploy(
  //   "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
  //   "0x7CB482133f3364DF2aC3998E7B33b066E3580129",
  //   "0xd9fED3F22D26D83A9d9FEF446B72a894c17471B4",
  //   "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
  //   "0xCC09Bb34e14A0746be29b8e3419f9478E555a0A6"
  // );
  // const queueAddress = await multicall.getAddress();
  // console.log(`multicall deployed to ${queueAddress}`);
  // const Donation = await ethers.getContractFactory("DonationBTCA");
  // const donation = await Donation.deploy(
  //   "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
  //   "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
  //   "0x09E30223c4bb6FfAD7A0dbca704C55608e00077B",
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
