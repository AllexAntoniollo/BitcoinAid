"use client";
import { balance, approve } from "@/services/Web3Services";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Error from "@/componentes/erro";
import { useWallet } from "@/services/walletContext";

export default function Home() {
  const [error, setError] = useState("");
  const [balanceValue, setBalanceValue] = useState<number | null>(null);
  const { address } = useWallet();

  const clearError = () => {
    setError(""); // Limpa o erro
  };

  async function getBalance(address: string) {
    try {
      const result = await balance(address);
      console.log(result);
      if (result !== undefined) {
        setBalanceValue(result);
      } else {
        setError("Deu pau");
      }
    } catch (err) {
      setError("Erro ao buscar o saldo");
    }
  }

  useEffect(() => {
    async function fetchBalance() {
      //await approve("0xaF6bdd5C107A1C98BB67293401683e02fA9983bB",1.5);
      if(address){
        await getBalance(address);
      }else{
        
      }
      
    }

    fetchBalance();
  }, [address]);

  console.log(balanceValue);

  return (
    <main className="w-100 h-screen">
        <p className="">Conteúdo Section</p>
        {error && <Error msg={error} onClose={clearError} />}
        {address ? (
          balanceValue !== null ? (
            <p>Saldo: {ethers.formatEther(balanceValue)} AiD</p>
          ) : (
            <p>Saldo: 00.0000</p>
          )
        ) : (
          <p>Saldo: -----</p>
        )}
    </main>
  );
}
