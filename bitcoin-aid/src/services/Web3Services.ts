import { ethers } from "ethers";
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;

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
export async function nomeDaFuncao() {
  const provider = await getProvider();

  const signer = await provider.getSigner();

  //EX instancia de contrato
  //const stakeContract = new ethers.Contract(STAKE_ADDRESS, StakeAbi, signer);

  //Ex chamando a função do contrato passando o parâmetro tokenId
  //   const tx = await stakeContract.stake(tokenId);

  //Espera a transação confirmar
  //   await tx.wait();
}
