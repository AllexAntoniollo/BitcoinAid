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
  const Donation = await ethers.getContractFactory("DonationBTCA");
  const donation = await Donation.deploy(
    "0x7bc9E3c20CCb65F065D8672e412975f38E426917",
    "0x1dD0dedBf32825652337F6BB7a3B3b4776547572",
    "0xc248414C2321D0A17c3386d69F2777015Afd5417"
  );
  const donationAddress = await donation.getAddress();
  console.log(`donationAddress deployed to ${donationAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
