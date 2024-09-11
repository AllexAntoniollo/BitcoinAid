import { ethers } from "hardhat";

async function main() {
  const BitcoinAid = await ethers.getContractFactory("BitcoinAid");
  const btca = await BitcoinAid.deploy();
  const btcaAddress = await btca.getAddress();
  console.log(`btcaAddress deployed to ${btcaAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
