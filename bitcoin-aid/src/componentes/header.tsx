"use client"
import React from "react";
import Image from "next/image";
import { useState } from "react";
import { doLogin } from "@/services/Web3Services";
import Link from "next/link";

export default function Header(){
        const [address, setAddress] = useState<string | null>(null);
        const [error, setError] = useState("");
        const [message, setMessage] = useState("");
        const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    }

    const handleLogin = async () => {
        try {
          const address = await doLogin();
          setAddress(address)
          setMessage("Login successful!");
          setError("");
        } catch (err) {
          setError("Failed to login. Please try again.");
          setMessage("");
        }
      };

    return(
        <header className=" bg-[#201f1b] border-b-4 border-[#eda921] p-2">
            <div className="container sm:max-w-[90%] m-auto flex items-center max-w-[98%]">
                <Image src="/images/LogoBTCA-PNG.png" alt="Logo Btca" width={80} height={80} className="max-w-[15%] max-h-[15%]"/>
                <p className="font-Agency text-[18px] sm:text-[22px]">BTCAiD</p>
                <div className="ml-auto flex items-center ">
                    <button onClick={toggleMenu} className="sm:hidden">Menu</button>
                    <p className="mr-[20px] hover:text-[#c5c5c5] hover:text-[17px] font-semibold hidden sm:block transition-all duration-300 ">Dashboard</p>
                    <p className="mr-[20px] hover:text-[#c5c5c5] hover:text-[17px] font-semibold hidden sm:block transition-all duration-300">White Paper</p>
                    {address ? (
                        <p className="text-[#eda921]">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p> // Exibe o endereço da carteira
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
                <Link href="nomePagina1"><div className="p-[8px] w-[100%] border-t-[2px] border-[#2c2b25] flex flex-col justify-center items-center cursor-pointer"><p className="">Dashboard</p></div></Link>
                <div className="p-[8px] w-[100%] border-t-[2px] border-[#2c2b25] flex flex-col justify-center items-center cursor-pointer"><a className="">White Paper</a></div>
                <div className="p-[8px] w-[100%] border-t-[2px] border-[#2c2b25] flex flex-col justify-center items-center cursor-pointer"><a className="">Market Place</a></div>
            </div>
            )}
        </header>
    )
}