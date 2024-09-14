"use client";
import { balance, approve, balanceDonationPool, userBalanceDonation, timeUntilNextWithDrawal, claim } from "@/services/Web3Services";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Error from "@/componentes/erro";
import Alert from "@/componentes/alert";
import { useWallet } from "@/services/walletContext";
import Image from "next/image";


export default function Home() {
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [poolBalanceValue, setPoolBalanceValue] = useState<number | null>(null);
  const [balanceValue, setBalanceValue] = useState<number | null>(null);
  const [userBalanceValue, setUserBalanceValue] = useState<number | null>(null);
  const { address } = useWallet();
  const [isFifteenDays, setFifteenDays] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);
  const [value, setValue] = useState('');
  const [time, setTime] = useState<number>(0);
  interface UserBalance {
    amount: ethers.BigNumberish;
    time: number;
    level: number;
    fifteen: boolean;
  }
  

  async function Countdown(){
    if(time > 0){      
      setTime(prevValor => prevValor - 1)
      console.log("chamou %d", Number(time));
    }
  }
  async function getTime(address:string) {
    try{
      const result = await timeUntilNextWithDrawal(address);
      setTime(Number(result));
    }catch{
      setError("Erro no getTime");
    }
      Countdown();
  }

  const handleMaxClick = () => {
    if (balanceValue !== null) {
      setValue(ethers.formatEther(balanceValue));
    }
  };

  const verifyValue = () => {
    const intValue = parseInt(value, 10);
    let finalBalance = 0;
    if (balanceValue !== null) {
      const intBalanceValue = parseInt(ethers.formatEther(balanceValue), 10);
      finalBalance = intBalanceValue;
    }
    if (intValue > finalBalance) {
      setError("Você não pode enviar essa quantia de token");
      setDonateOpen(false);
    } else {
      setError(""); // Limpa o erro se o valor for válido
    }
  };

  const toggle = () => {
    setFifteenDays(prevState => !prevState);
  };

  const openDonate = () => {
    setDonateOpen(prevState => !prevState);
  };

  const clearError = () => {
    setError(""); // Limpa o erro
  };

  const clearAlert = () => {
    setAlert("");
  };

  async function getBalance(address: string) {
    try {
      const result = await balance(address);
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

  async function getUserBalance(address: string) {
    try {
      if (address) {
        const result = await userBalanceDonation(address);
        if (result.amount !== null) {
          setUserBalanceValue(result[0]);  // Corrigido para 'amount'
        }
      } else {
        setUserBalanceValue(0); // Correção para lidar com endereços nulos
      }
    } catch (err) {
      setError("Erro ao buscar valor doado");
    }
  }

  async function getPoolBalance() {
    try {
      const result = await balanceDonationPool();
      if (result !== null) {
        setPoolBalanceValue(result);
      } else {
        setPoolBalanceValue(null);
      }
    } catch (err) {
      setPoolBalanceValue(0); // Correção para lidar com erros
    }
  }

  async function doClaim() {
    try{
      const ok = await claim();
      if(ok){
        setAlert("Sucesso no Claim");
      }
    }catch{
      setError("Erro ao realizar o Claim");
    }
  }

useEffect(() => {
    async function fetchBalance() {
      if (address) {
        await getBalance(address);
      } else {
        setBalanceValue(null);
      }
    }

    fetchBalance();
    getPoolBalance();
    if (address) {
      getTime(address);
      getUserBalance(address);
    }else{
      setTime(0);
    }
  }, [address]);

  useEffect(() => {
    let start = Date.now(); // Obtém o tempo inicial
    const interval = 1000; // Intervalo de 1 segundo
  
    const intervalId = setInterval(() => {
      const now = Date.now(); 
      const elapsed = now - start; // Tempo real decorrido
      const remainingTime = Math.max(time - Math.floor(elapsed / 1000), 0); // Ajusta o tempo restante
  
      setTime(remainingTime); // Atualiza o estado do tempo
      
      if (remainingTime === 0) {
        clearInterval(intervalId); // Para o intervalo quando o tempo chegar a 0
      }
    }, interval);
  
    return () => clearInterval(intervalId);
  }, [time]);
  
  useEffect(()=>{
    if(address){
      getTime(address);
    }
  })

  return (
    <main className="w-100">
        {error && <Error msg={error} onClose={clearError} />}
        {alert && <Alert msg={alert} onClose={clearAlert}/>}
        <div className="container min-h-screen max-w-[98%] lg:max-w-[90%] m-auto flex flex-wrap items-center p-[30px] lg:p-[60px]">
          
          <p className="leading-tight font-Agency text-[70px] sm:text-[90px] font-normal w-full">Bitcoin AiD Protocol</p>
          <div className="mt-[50px] w-full lg:max-w-[40%] max-w-[100%] border-l-2 border-[#282722] p-8 ">
            {poolBalanceValue ? (
              <p className="font-semibold text-[35px] lg:text-[46px] w-full">{ethers.formatEther(poolBalanceValue)}<span className="text-[#d79920]">AiD</span></p>
            ) : (
              <p className="font-semibold text-[35px] lg:text-[46px] w-full">----- <span className="text-[#d79920]">AiD</span></p>
            )}
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
            <div className="max-w-[700px] p-[20px] bg-gradient-to-t from-[#201f1b] to-[#434139] w-[100%] md:w-[70%] lg:w-[45%] h-[500px] border-2 border-[#d79920] rounded-[3rem] mr-[40px]">
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
                  {userBalanceValue !== undefined && userBalanceValue !== null?(
                    <p className="text-[30px] font-Agency">Total Contributed: {ethers.formatEther(userBalanceValue)} <span className="text-[#d79920]">AiD</span></p>
                  ):(
                    <p className="text-[30px] font-Agency">Total Contributed: ---- <span className="text-[#d79920]">AiD</span></p>
                  )}
                  
                  <p className="text-[25px] font-Agency">$00.00</p>
                </div>
                <div className="flex justify-center items-end pb-[20px]">
                   <button onClick={openDonate} className="rounded-3xl text-[30px] font-Agency w-[80%] bg-[#d79920]">
                      Contribute Now +
                    </button>
                </div>    
              </div>
            </div>


            <div className="max-w-[700px] p-[20px] bg-gradient-to-t from-[#201f1b] to-[#434139] w-[100%] md:w-[70%] lg:w-[45%] h-[500px] border-2 border-[#3a6e01] rounded-[3rem] mr-[40px] mt-[30px] lg:mt-[0px]">
              <div className="flex items-center">
              <Image src="/images/LogoBTCA-PNG.png" alt="Logo Btca" width={150} height={150} className="max-w-[25%] max-h-[25%]" />
              <p className="text-[30px] font-semibold">Claim AiD</p>
              </div>

              <div className="flex justify-between flex-col items-center m-auto w-[95%] h-[300px] bg-[#434139] rounded-3xl ">
                <div className="pt-[30px]">
                  <p className="font-Agency text-[30px]">CLAIMABLE REWARDS</p>
                  {userBalanceValue !== undefined && userBalanceValue !== null?(
                     <p className="font-Agency text-center text-[28px]">{ethers.formatEther(userBalanceValue)}<span className="text-[#d79920]">AiD</span></p>
                  ) : (
                    <p className="font-Agency text-center text-[28px]">---- <span className="text-[#d79920]">AiD</span></p>
                  )}
                 
                  <p className="font-Agency text-center text-[23px]">$00.00</p>
                </div>
                <div className="flex flex-col justify-end items-center pb-[20px] w-full">
                <p className="text-center mb-[2px]">Time to Claim</p>
                { time !== 0 || userBalanceValue == 0 || userBalanceValue == undefined ? (
                  <>
                    <p className="text-center mb-[10px]">{Math.floor(time/86400)}D: {Math.floor(time/3600)}H: {Math.floor(time/60)}M: {Math.floor(time%60)}S</p>
                    <button className="cursor-default rounded-3xl text-[30px] font-Agency w-[80%] border-2 border-gray">
                      <p className="text-gray">CLAIM</p>
                    </button>
                  </>
                ):(
                  <>
                    <p className="text-center mb-[10px]">00D:00H:00M:00S</p>
                    <button onClick={doClaim} className="rounded-3xl text-[30px] font-Agency w-[80%] border-2 border-[#3a6e01] hover:bg-[#424039]">
                      <p className="text-[#3a6e01]">CLAIM</p>
                    </button>
                  </>
                )}
                
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

