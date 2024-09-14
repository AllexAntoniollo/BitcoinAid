"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { doLogin } from "@/services/Web3Services";
import Link from "next/link";
import { useWallet } from "@/services/walletContext";
import { FaBars } from "react-icons/fa";

export default function Header() {
  const { address, setAddress } = useWallet();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  const handleLogin = async () => {
    try {
      const newAddress = await doLogin();
      setAddress(newAddress);
      setMessage("Login successful!");
      setError("");
    } catch (err) {
      setError("Failed to login. Please try again.");
      setMessage("");
    }
  };

  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const savedAddress = localStorage.getItem('userAddress');
            if (savedAddress === accounts[0]) {
              setAddress(savedAddress);
            } else {
              localStorage.removeItem('userAddress'); // Remove o endereço inválido
            }
          }
        } catch (err) {
          console.error("Failed to check MetaMask accounts:", err);

        }

        // Adiciona listeners para eventos de mudança de conta e desconexão
        window.ethereum.on('accountsChanged', (accounts:string) => {
          if (accounts.length === 0) {
            // Se a conta estiver desconectada, limpa o cache
            localStorage.removeItem('userAddress');
            setAddress(null); // Limpa o estado da carteira
          } else {
            // Se uma nova conta estiver conectada, atualiza o estado
            setAddress(accounts[0]);
            localStorage.setItem('userAddress', accounts[0]);
          }
        });

        window.ethereum.on('disconnect', () => {
          // Quando desconectar, limpa o cache
          localStorage.removeItem('userAddress');
          setAddress(null);
        });
      }
    };

    checkMetaMask();

    // Limpeza dos listeners ao desmontar o componente
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('disconnect', () => {});
      }
    };
  }, []);

  useEffect(() => {
    if (address) {
      localStorage.setItem('userAddress', address);
    }
  }, [address]);

  return (
    <header className="bg-[#201f1b] border-b-4 border-[#eda921] p-2">
      <div className="container sm:max-w-[90%] m-auto flex items-center max-w-[98%]">
        <Image src="/images/LogoBTCA-PNG.png" alt="Logo Btca" width={80} height={80} className="max-w-[15%] max-h-[15%]" />
        <p className="font-Agency text-[18px] sm:text-[22px]">BTCAiD</p>
        <div className="ml-auto flex items-center">
          <button onClick={toggleMenu} className="sm:hidden mr-[12px]"><FaBars size={20}></FaBars></button>
          <Link href="/"><p className="mr-[20px] hover:text-[#c5c5c5] hover:text-[17px] font-semibold hidden sm:block transition-all duration-300">Home</p></Link>
          <Link href="/nft"><p className="mr-[20px] hover:text-[#c5c5c5] hover:text-[17px] font-semibold hidden sm:block transition-all duration-300">Dashboard</p></Link>
          <Link href="/nft"><p className="mr-[20px] hover:text-[#c5c5c5] hover:text-[17px] font-semibold hidden sm:block transition-all duration-300">White Paper</p></Link>
          <Link href="/nft"> <p className="mr-[20px] hover:text-[#c5c5c5] hover:text-[17px] font-semibold hidden sm:block transition-all duration-300">Nft's</p></Link>
          {address ? (
            <p className="text-[#eda921]">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
          ) : (
            <button
              onClick={handleLogin}
              className="text-[12px] p-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] hover:p-[10px] sm:text-[15px] font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      {isMenuOpen && (
        <div className="mt-[20px] w-[100%] menu sm:hidden animate-slide-down">
          <Link href="/">
            <div className="p-[8px] w-[100%] border-t-[2px] border-[#2c2b25] flex flex-col justify-center items-center cursor-pointer">
              <p className="">Home</p>
            </div>
          </Link>
          <Link href="/nft">
            <div className="p-[8px] w-[100%] border-t-[2px] border-[#2c2b25] flex flex-col justify-center items-center cursor-pointer">
              <p className="">Dashboard</p>
            </div>
          </Link>
          <Link href="/nft">
          <div className="p-[8px] w-[100%] border-t-[2px] border-[#2c2b25] flex flex-col justify-center items-center cursor-pointer">
            <a className="">White Paper</a>
          </div>
          </Link>
          <Link href="/nft">
          <div className="p-[8px] w-[100%] border-t-[2px] border-[#2c2b25] flex flex-col justify-center items-center cursor-pointer">
            <a className="">Nft's</a>
          </div>
          </Link>
        </div>
      )}
    </header>
  );
}
