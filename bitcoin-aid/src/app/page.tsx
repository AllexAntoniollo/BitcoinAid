"use client";
import { balance, approve } from "@/services/Web3Services";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Error from "@/componentes/erro";
import { useWallet } from "@/services/walletContext";
import Image from "next/image";

export default function Home() {
  const [error, setError] = useState("");
  const [balanceValue, setBalanceValue] = useState<number | null>(null);
  const { address } = useWallet();
  const [isFifteenDays, setFifteenDays] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleMaxClick = () => {
    if (balanceValue !== null) {
      setValue(ethers.formatEther(balanceValue));
    }
  };

  const verifyValue = () => {
    const intValue = parseInt(value, 10);
    if(balanceValue !== null){
      const intBalanceValue = ethers.formatEther(balanceValue);
      var finalBalance = parseInt(intBalanceValue, 10);
    }else{
      finalBalance = 0;
    }
      if (balanceValue !== null && intValue > finalBalance) {
      setError("Você não pode enviar essa quantia de token");
      setDonateOpen(false);
    } else {
      setError(""); // Limpa o erro se o valor for válido
    }
  };

  const toggle = () => {
    setFifteenDays(prevState => !prevState);
  }

  const openDonate = () =>{
    setDonateOpen(prevState => !prevState);
  }

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
        setBalanceValue(null);
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
      }else if(!address){
        setBalanceValue(null);
      }
      
    }

    fetchBalance();
  }, [address]);

  console.log(balanceValue);

  return (
    <main className="w-100">
        {error && <Error msg={error} onClose={clearError} />}
        <div className="container max-w-[98%] lg:max-w-[90%] m-auto flex flex-wrap items-center p-[30px] lg:p-[60px]">
          <div className="transform translate-y-[300px] bg-[url('/images/Polygon_bg.png')]  bg-center z-[-1] inset-0 absolute"></div>
          <div className="transform translate-y-[500px] bg-[url('/images/Polygon_bg.png')] bg-center z-[-1] inset-0 absolute"></div>
          <p className="leading-tight font-Agency text-[70px] sm:text-[90px] font-normal w-full">Bitcoin AiD Protocol</p>
          <div className="mt-[50px] w-full lg:max-w-[40%] max-w-[100%] border-l-2 border-[#282722] p-8 ">
            <p className="font-semibold text-[35px] lg:text-[46px] w-full">1.890 B</p>
            <p className="text-[#d79920] text-[13px] lg:text-[18px] font-semibold ">Donation Pool</p>
          </div>
          <div className="mt-[30px] lg:mt-[50px] w-[100%] md:w-[60%] border-l-2 border-[#282722] p-8 ">
            <p className="font-semibold text-[35px] lg:text-[46px] w-full ">$0.0002380</p>
            <p className="text-[#d79920] text-[13px] lg:text-[18px] font-semibold">1 AiD Price</p>
          </div>

          <div className="btn-days w-full">
            {isFifteenDays ? (
                <div className="mt-[50px]">
                  <button className="sm:w-[120px] w-[100px] mr-[15px] bg-[#d79920] p-[10px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] hover:p-[10px] sm:text-[15px] font-semibold">
                    <p className="sm:text-[20px] text-[16px] font-semibold">15 Days</p>
                  </button>
                  <button onClick={toggle} className="sm:w-[120px] w-[100px] p-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] hover:p-[10px] sm:text-[15px] font-semibold">
                    <p className="sm:text-[20px] text-[16px] font-semibold">30 Days</p>
                  </button>
                </div>
            ) : (
              <div className="mt-[50px]">
                  <button onClick={toggle} className="sm:w-[120px] w-[100px] p-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] hover:p-[10px] sm:text-[15px] font-semibold">
                    <p className="sm:text-[20px] text-[16px] font-semibold">15 Days</p>
                  </button>
                  <button className="sm:w-[120px] w-[100px] ml-[15px] bg-[#d79920] p-[10px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] hover:p-[10px] sm:text-[15px] font-semibold">
                    <p className="sm:text-[20px] text-[16px] font-semibold">30 Days</p>
                  </button>
                </div>
            )}
          </div>
          <div className="cards w-[100%] lg:flex mt-[50px]">
            <div className="p-[20px] bg-gradient-to-t from-[#201f1b] to-[#434139] w-[100%] md:w-[70%] lg:w-[45%] h-[500px] border-2 border-[#d79920] rounded-[3rem] mr-[40px]">
              <div className="flex items-center">
              <Image src="/images/LogoBTCA-PNG.png" alt="Logo Btca" width={150} height={150} className="max-w-[25%] max-h-[25%]" />
              <p className="text-[30px] font-semibold">Contribute AiD</p>
              </div>

              <div className="flex flex-col justify-between m-auto w-[95%] h-[300px] bg-[#434139] rounded-3xl ">
                <div className="pt-[30px] pl-[8%]">
                  {address ? (
                    balanceValue !== null ? (
                      <p className="text-[30px] font-Agency">Wallet Balance: {ethers.formatEther(balanceValue)} <span className="text-[#d79920]">AiD</span></p>
                    ) : (
                      <p className="text-[30px] font-Agency">Wallet Balance: 00.0000<span className="text-[#d79920]">AiD</span></p>
                    ) 
                  ) : (
                    <p className="text-[30px] font-Agency">Wallet Balance: ------</p>
                  )}
                  <p className="text-[25px] font-Agency">$235.62</p>
                  <p className="text-[30px] font-Agency">Total Contributed: 00.0000 <span className="text-[#d79920]">AiD</span></p>
                  <p className="text-[25px] font-Agency">$00.00</p>
                </div>
                <div className="flex justify-center items-end pb-[20px]">
                   <button onClick={openDonate} className="rounded-3xl text-[30px] font-Agency w-[80%] bg-[#d79920]">
                      Contribute Now +
                    </button>
                </div>    
              </div>
            </div>


            <div className="p-[20px] bg-gradient-to-t from-[#201f1b] to-[#434139] w-[100%] md:w-[70%] lg:w-[45%] h-[500px] border-2 border-[#3a6e01] rounded-[3rem] mr-[40px] mt-[30px] lg:mt-[0px]">
              <div className="flex items-center">
              <Image src="/images/LogoBTCA-PNG.png" alt="Logo Btca" width={150} height={150} className="max-w-[25%] max-h-[25%]" />
              <p className="text-[30px] font-semibold">Claim AiD</p>
              </div>

              <div className="flex justify-between flex-col items-center m-auto w-[95%] h-[300px] bg-[#434139] rounded-3xl ">
                <div className="pt-[30px]">
                  <p className="font-Agency text-[30px]">CLAIMABLE REWARDS</p>
                  <p className="font-Agency text-center text-[28px]">00.0000 <span className="text-[#d79920]">AiD</span></p>
                  <p className="font-Agency text-center text-[23px]">$00.00</p>
                </div>
                <div className="flex flex-col justify-end items-center pb-[20px] w-full">
                <p className="text-center mb-[2px]">Time to Claim</p>
                  <p className="text-center mb-[10px]">00d 00h 00m 00s</p>
                   <button className="rounded-3xl text-[30px] font-Agency w-[80%] border-2 border-[#3a6e01]">
                      CLAIM
                    </button>
                </div>    
              </div>
            </div>

          </div>
        </div>

        {donateOpen ? (
           <div className="fixed inset-0 flex items-center justify-center z-50">
           <div className="fixed inset-0 bg-black opacity-80" onClick={openDonate}></div>
           <div className="relative bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
             <button 
               className="absolute top-4 right-4 text-red-600"
               onClick={openDonate}
             >
               <p className="font-bold">X</p>
             </button>
             <p className="text-center text-white text-[23px]">Contributing <span className="text-[#eda921]">AiD</span></p>
              {balanceValue !== null ? (
                <input onChange={(e) => setValue(e.target.value)} value={value} className="w-full m-w-[90%] p-2 bg-[#33322d] rounded-3xl mt-[20px] focus:outline-none focus:border-2 focus:border-[#eda921]" type="number" placeholder={ethers.formatEther(balanceValue)}></input>
                
              ) : (
                <input className="w-full m-w-[90%] p-2 bg-[#33322d] rounded-3xl mt-[20px] focus:outline-none focus:border-2 focus:border-[#eda921]" type="number" placeholder="Connect Your Wallet"></input>
              )}
              <button onClick={handleMaxClick} className="text-[#eda921] ml-[10px] font-bold mt-[3px]">MAX</button>
              <div className="w-full flex flex-col items-center mb-[15px] mt-[10px]">
                <button onClick={verifyValue} className="w-[150px] font-semibold rounded-3xl bg-[#eda921] p-[8px]">Contribute</button>
              </div>
           </div>

         </div>
        
         
        ) : ("")}
        <p>All Rigths Reserveds</p>
    </main>
  );   
}

