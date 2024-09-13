import { ethers } from "ethers";
import tokenAbi from "./Token.abi.json";
import donationAbi from "./Donation.abi.json";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const DONATION_ADDRESS = process.env.NEXT_PUBLIC_DONATION_ADDRESS;

function getProvider() {
  if (!window.ethereum) throw new Error("No MetaMask found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function doLogin() {
  try {
    const provider = await getProvider();
    const account = await provider.send("eth_requestAccounts", []);
    if (!account || !account.length)
      throw new Error("Wallet not found/allowed.");
    await provider.send("wallet_switchEthereumChain", [{ chainId: CHAIN_ID }]);
    return account[0];
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
}

export async function balance(address:string) {
  const provider = await getProvider();

  const signer = await provider.getSigner();
  

  //EX instancia de contrato
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS ? TOKEN_ADDRESS : "", tokenAbi, signer);

  const balance = await tokenContract.balanceOf(address);

  return balance;

  //Ex chamando a função do contrato passando o parâmetro tokenId
  //   const tx = await stakeContract.stake(tokenId);

  //Espera a transação confirmar
  //   await tx.wait();
}


export async function approve(spender:string, amount:number) {
  const provider = await getProvider();

  const signer = await provider.getSigner();

  //EX instancia de contrato
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS ? TOKEN_ADDRESS : "", tokenAbi, signer);

  await tokenContract.approve(spender, ethers.parseUnits(String(amount),"ether"));


  //Ex chamando a função do contrato passando o parâmetro tokenId
  //   const tx = await stakeContract.stake(tokenId);

  //Espera a transação confirmar
  //   await tx.wait();
}

export async function balanceDonationPool(){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const donationContract = new ethers.Contract(DONATION_ADDRESS ? DONATION_ADDRESS : "", donationAbi, signer);

  const donationBalance = await donationContract.distributionBalance();
  return donationBalance;
}

export async function userBalanceDonation(address:string){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const donationContract = new ethers.Contract(DONATION_ADDRESS ? DONATION_ADDRESS : "", donationAbi, signer);

  const userDonationBalance = await donationContract.getUser(address);
  console.log(userDonationBalance);
  return userDonationBalance;
}