import { ethers } from "hardhat";

async function main() {
  const BitcoinAid = await ethers.getContractFactory("BitcoinAid");
  const btca = await BitcoinAid.deploy({ gasPrice: 90000000000 });
  const btcaAddress = await btca.getAddress();
  const Usdt = await ethers.getContractFactory("USDT");
  const usdt = await Usdt.deploy({ gasPrice: 90000000000 });
  const usdtAddress = await usdt.getAddress();
  console.log(`btcaAddress deployed to ${btcaAddress}`);
  console.log(`usdtAddress deployed to ${usdtAddress}`);
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy(
    usdtAddress,
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
    { gasPrice: 90000000000 }
  );
  const paymentManagerAddress = await paymentManager.getAddress();
  console.log(`PaymentManager deployed to ${paymentManagerAddress}`);
  const ReserveBTCA = await ethers.getContractFactory("ReserveBTCA");
  const reserveBtca = await ReserveBTCA.deploy(
    usdtAddress,
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
    { gasPrice: 90000000000 }
  );
  const reserveBtcaAddress = await reserveBtca.getAddress();
  console.log(`reserveBtca deployed to ${reserveBtcaAddress}`);
  const ReservePools = await ethers.getContractFactory("ReservePools");
  const reservePools = await ReservePools.deploy(
    usdtAddress,
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
    { gasPrice: 90000000000 }
  );
  const reservePoolsAddress = await reservePools.getAddress();
  console.log(`reservePools deployed to ${reservePoolsAddress}`);
  // const UniswapOracle = await ethers.getContractFactory("UniswapOracle");
  // const uniswapOracle = await UniswapOracle.deploy({ gasPrice: 90000000000 });
  // const uniswapOracleAddress = await uniswapOracle.getAddress();
  // await uniswapOracle.setBtca(btcaAddress, { gasPrice: 90000000000 });
  // await uniswapOracle.setUsdt("0xc2132D05D31c914a87C6611C10748AEb04B58e8F", {
  //   gasPrice: 90000000000,
  // });
  // console.log(`Oracle deployed to ${uniswapOracleAddress}`);
  const BTCACollection = await ethers.getContractFactory("BTCACollection");
  const collection = await BTCACollection.deploy(
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
    usdtAddress,
    paymentManagerAddress,
    { gasPrice: 90000000000 }
  );
  const collectionAddress = await collection.getAddress();
  console.log(`collection deployed to ${collectionAddress}`);
  const Queue = await ethers.getContractFactory("QueueDistribution");
  const queue = await Queue.deploy(
    collectionAddress,
    btcaAddress,
    "0x6f3b14253D5A4B18ada0CBcBe6AeB7d6C2f56E16",
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
    { gasPrice: 90000000000 }
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
  const Donation = await ethers.getContractFactory("DonationBTCA");
  const donation = await Donation.deploy(
    btcaAddress,
    usdtAddress,
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
    paymentManagerAddress,
    reserveBtcaAddress,
    reservePoolsAddress,
    "0x6f3b14253D5A4B18ada0CBcBe6AeB7d6C2f56E16",
    queueAddress,
    { gasPrice: 90000000000 }
  );
  const donationAddress = await donation.getAddress();
  console.log(`donationAddress deployed to ${donationAddress}`);
  await queue.setDonationContract(donationAddress, { gasPrice: 90000000000 });
  await reserveBtca.setCollection(collectionAddress, { gasPrice: 90000000000 });
  await reserveBtca.setDonation(donationAddress, { gasPrice: 90000000000 });
  await reservePools.setCollection(collectionAddress, {
    gasPrice: 90000000000,
  });
  await reservePools.setDonation(donationAddress, { gasPrice: 90000000000 });
  await paymentManager.setCollection(collectionAddress, {
    gasPrice: 90000000000,
  });
  await paymentManager.setDonation(donationAddress, { gasPrice: 90000000000 });
  await collection.setReserveBtca(reserveBtcaAddress, {
    gasPrice: 90000000000,
  });
  await collection.setReservePools(reservePoolsAddress, {
    gasPrice: 90000000000,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
