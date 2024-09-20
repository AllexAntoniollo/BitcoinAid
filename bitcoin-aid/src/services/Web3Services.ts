import { ethers } from "ethers";
import tokenAbi from "./Token.abi.json";
import donationAbi from "./Donation.abi.json";
import queueAbi from "./Queue.abi.json";
import collectionAbi from "./Collection.abi.json";
import usdtAbi from "./Usdt.abi.json";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const DONATION_ADDRESS = process.env.NEXT_PUBLIC_DONATION_ADDRESS;
const QUEUE_ADDRESS = process.env.NEXT_PUBLIC_QUEUE_ADDRESS;
const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS;
const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS
import { nftQueue } from "./types";
import { promises } from "dns";

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

export async function allow(address:string, contract:string) {
  const provider = await getProvider();

  const signer = await provider.getSigner();

  const getAllowance = new ethers.Contract(TOKEN_ADDRESS ? TOKEN_ADDRESS : "", tokenAbi, signer);

  const allowance = await getAllowance.allowance(address, contract);

  console.log(allowance);
  return allowance;

}


export async function approve(spender:string, amount:number) {
  const provider = await getProvider();

  const signer = await provider.getSigner();

  //EX instancia de contrato
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS ? TOKEN_ADDRESS : "", tokenAbi, signer);

  const tx = await tokenContract.approve(spender, ethers.parseUnits(String(amount),"ether"));
  await tx.wait();
  return true;
}

export async function donation(amount:number,fifteenDays:boolean){
  const provider = await getProvider();

  const signer = await provider.getSigner();

  const doDonate = new ethers.Contract(DONATION_ADDRESS ? DONATION_ADDRESS : "", donationAbi, signer);
  const amountWei = ethers.parseUnits(amount.toString(), "ether");
  const tx = await doDonate.donate(amountWei, fifteenDays);
  await tx.wait();
  return true;

}

export async function balanceDonationPool(){
  const provider = new ethers.JsonRpcProvider('https://polygon-amoy.drpc.org');


  const donationContract = new ethers.Contract(DONATION_ADDRESS ? DONATION_ADDRESS : "", donationAbi, provider);

  const donationBalance = await donationContract.distributionBalance();
  return donationBalance;
}

export async function userBalanceDonation(address:string){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const donationContract = new ethers.Contract(DONATION_ADDRESS ? DONATION_ADDRESS : "", donationAbi, signer);

  const userDonationBalance = await donationContract.getUser(address);
  return userDonationBalance;
}

export async function timeUntilNextWithDrawal(address:string){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const donationContract = new ethers.Contract(DONATION_ADDRESS ? DONATION_ADDRESS : "", donationAbi, signer);

  const timeUntil = await donationContract.timeUntilNextWithdrawal(address);
  return timeUntil;
}

export async function claim(){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const donationContract = new ethers.Contract(DONATION_ADDRESS ? DONATION_ADDRESS : "", donationAbi, signer);
  try{
    const tx = await donationContract.claimDonation();
    await tx.wait();
    return true;
  } catch{
    console.log("erro ao claim");
    return false;
  }
}

export async function getQueue(batchLevel:number) : Promise<nftQueue[]>{
  const provider = new ethers.JsonRpcProvider('https://polygon-amoy.drpc.org');

  const queueContract = new ethers.Contract(QUEUE_ADDRESS ? QUEUE_ADDRESS : "", queueAbi, provider);

  const getQueueDetails:nftQueue[] = await queueContract.getQueueDetails(batchLevel);
  return getQueueDetails;
}

export async function addQueue(batch:number){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const queueContract = new ethers.Contract(QUEUE_ADDRESS ? QUEUE_ADDRESS : "", queueAbi, signer);

  await queueContract.addToQueue(batch);
}

export async function getCurrentBatch(){
  const provider = new ethers.JsonRpcProvider('https://polygon-amoy.drpc.org');

  const collectionContract = new ethers.Contract(COLLECTION_ADDRESS ? COLLECTION_ADDRESS : "", collectionAbi, provider);

  const currentBatch = await collectionContract.getCurrentBatch();
  return currentBatch;
}



export async function mintNft(quantity:number){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const collectionContract = new ethers.Contract(COLLECTION_ADDRESS ? COLLECTION_ADDRESS : "", collectionAbi, signer);

  try{
    const tx = await collectionContract.mint(quantity);
    await tx.wait();
    return true;
  }catch(err){
    return false;
  }

}

export async function nftPrice(batch:number){
  const provider = new ethers.JsonRpcProvider('https://polygon-amoy.drpc.org');

  const collectionContract = new ethers.Contract(COLLECTION_ADDRESS ? COLLECTION_ADDRESS : "", collectionAbi, provider);

  const price = await collectionContract.getBatchPrice(batch);
  return price;
}

export async function approveMint(value:BigInt) {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const mint = new ethers.Contract(USDT_ADDRESS ? USDT_ADDRESS : "", usdtAbi, signer);

  const tx = await mint.approve(COLLECTION_ADDRESS, value);
  await tx.wait();

  return true;
}
























export async function usersNft(batch:number, address:string){
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const nftUsers = new ethers.Contract(QUEUE_ADDRESS ? QUEUE_ADDRESS : "", collectionAbi, signer);

  const nfts = await nftUsers.getUsersNFTsInSpecificQueue(batch, address);
  return nfts;
}
