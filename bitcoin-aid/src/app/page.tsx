"use client";
import {
  donation,
  doLogin,
  allow,
  balance,
  approve,
  balanceDonationPool,
  userBalanceDonation,
  timeUntilNextWithDrawal,
  claim,
  getTokenPrice,
  getBalanceClaim,
} from "@/services/Web3Services";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Error from "@/componentes/erro";
import Alert from "@/componentes/alert";
import { TbLockAccess } from "react-icons/tb";
import { useWallet } from "@/services/walletContext";
import { SiPolygon } from "react-icons/si";
import Image from "next/image";
const DONATION_ADDRESS = process.env.NEXT_PUBLIC_DONATION_ADDRESS;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [poolBalanceValue, setPoolBalanceValue] = useState<number | null>(null);
  const [balanceValue, setBalanceValue] = useState<number>(0);
  const [userBalanceValue, setUserBalanceValue] = useState<number | null>(null);
  const { address, setAddress } = useWallet();
  const [isFifteenDays, setFifteenDays] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);
  const [aproveOpen, setApproveOpen] = useState(false);
  const [value, setValue] = useState("");
  const [time, setTime] = useState<number>(0);
  const [tempo, setTempo] = useState<number>(0);
  const [allowance, setAllowance] = useState<number>(0);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [balanceClaimed, setBalanceClaimed] = useState<number>(0);

  interface UserBalance {
    amount: ethers.BigNumberish;
    time: number;
    level: number;
    fifteen: boolean;
  }

  async function getPriceToken() {
    const result = await getTokenPrice();
    if (result) {
      setTokenPrice(Number(result) / 1000000);
    } else {
      setTokenPrice(0);
    }
  }

  const verifyAddress = (address: any) => {
    return ethers.isAddress(address);
  };

  async function approveToken(address: string, value: number) {
    try {
      setLoading(true);
      setApproveOpen(false);
      if (DONATION_ADDRESS) {
        const result = await approve(DONATION_ADDRESS, value);
        if (result) {
          await getAllowance(address, DONATION_ADDRESS);
          setLoading(false);
          setAlert("Now you can make donations!");
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(`Error: ` + err.reason);
    }
  }
  async function getAllowance(address: string, contract: string) {
    try {
      const result = await allow(address, contract);
      if (result) {
        let etherValue = ethers.formatEther(result);
        const etherNumber = parseFloat(etherValue);
        await setAllowance(etherNumber);
      } else {
        setAllowance(0);
      }
    } catch (err: any) {
      setError(`Error granting permission: ` + err.reason);
    }
  }
  async function getTime(address: string) {
    try {
      const result = await timeUntilNextWithDrawal(address);
      setTime(Number(result));
    } catch {
      setError(`Failed to start clock ${address}`);
    }
  }

  useEffect(() => {
    const Countdown = () => {
      if (time > 0) {
        setTempo(time - 1);
      }
    };
    Countdown();
  }, [time]);

  const handleMaxClick = () => {
    if (balanceValue !== null) {
      setValue(ethers.formatEther(balanceValue));
    }
  };

  const Donate = async () => {
    const intValue = parseInt(value, 10);
    let finalBalance = 0;
    if (balanceValue !== null) {
      const intBalanceValue = parseInt(ethers.formatEther(balanceValue), 10);
      finalBalance = intBalanceValue;
    }
    if (intValue > finalBalance) {
      setError("You cannot send this amount of token");
      setDonateOpen(false);
    } else {
      setError("");
      setLoading(true);
      setDonateOpen(false); // Limpa o erro se o valor for válido
      try {
        const result = await donation(Number(value), isFifteenDays);
        if (result && address) {
          setLoading(false);
          setAlert("Your donation has been successfully received");
          getBalanceClaim(address);
          getUserBalance(address);
        }
      } catch (err: any) {
        setLoading(false);
        setError("Something went wrong: " + err.reason);
      }
    }
  };

  const toggle = () => {
    setFifteenDays((prevState) => !prevState);
  };

  const openDonate = () => {
    setDonateOpen((prevState) => !prevState);
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
        setBalanceValue(0);
        setError("");
      }
    } catch (err) {
      setError(`Error fetching balance ${address}`);
    }
  }

  async function getBalanceClaimed(address: string) {
    try {
      const result = await getBalanceClaim(address);
      setBalanceClaimed(Number(result) / 1000000);
    } catch (err) {
      setBalanceClaimed(0);
    }
  }

  async function getUserBalance(address: string) {
    try {
      if (address) {
        const result = await userBalanceDonation(address);
        if (result.amount !== null) {
          setUserBalanceValue(result[0]); // Corrigido para 'amount'
        }
      } else {
        setUserBalanceValue(0); // Correção para lidar com endereços nulos
      }
    } catch (err) {
      setError(`Error fetching donated amount ${address}`);
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
    setLoading(true);
    try {
      const ok = await claim();
      if (ok) {
        setLoading(false);
        setAlert(
          `Your $${
            Number(userBalanceValue) / 1000000
          } dollars in BTCA are now available in your wallet`
        );
        if (address) {
          await getUserBalance(address);
          await getBalanceClaimed(address);
        }
      } else {
        setLoading(false);
        setError("It was not possible to make the withdraw, try again");
      }
    } catch(error: any) {
      setError("It was not possible to make the withdraw, try again: "+error.reason);
    }
  }

  useEffect(() => {
    async function fetchBalance() {
      if (address) {
        await getBalance(address);
        await getBalanceClaimed(address);
      } else {
        setBalanceValue(0);
      }
    }
    fetchBalance();
    getPoolBalance();
    if (address) {
      if (DONATION_ADDRESS) {
        getAllowance(address, DONATION_ADDRESS);
      }
      getBalanceClaimed(address);
      getTime(address);
      getUserBalance(address);
    } else {
      setTime(0);
    }
  }, [address, userBalanceValue]);

  useEffect(() => {
    if (address) {
      getBalanceClaimed(address);
    }
    getPriceToken();
  });

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

  const handleLogin = async () => {
    try {
      const newAddress = await doLogin();
      setAddress(newAddress);
      setAlert("Login successful!");
      setError("");
    } catch (err) {
      setError("Failed to login. Please try again.");
      setAlert("");
    }
  };

  const handleApproveOpen = async () => {
    setApproveOpen((prevState) => !prevState);
    setDonateOpen(false);
  };

  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const savedAddress = localStorage.getItem("userAddress");
            if (savedAddress === accounts[0]) {
              setAddress(savedAddress);
            } else {
              localStorage.removeItem("userAddress"); // Remove o endereço inválido
            }
          }
        } catch (err) {
          console.error("Failed to check MetaMask accounts:", err);
        }

        // Adiciona listeners para eventos de mudança de conta e desconexão
        window.ethereum.on("accountsChanged", (accounts: string) => {
          if (accounts.length === 0) {
            // Se a conta estiver desconectada, limpa o cache
            localStorage.removeItem("userAddress");
            setAddress(null); // Limpa o estado da carteira
          } else {
            // Se uma nova conta estiver conectada, atualiza o estado
            setAddress(accounts[0]);
            localStorage.setItem("userAddress", accounts[0]);
          }
        });

        window.ethereum.on("disconnect", () => {
          // Quando desconectar, limpa o cache
          localStorage.removeItem("userAddress");
          setAddress(null);
        });
      }
    };
    checkMetaMask();
  });

  return (
    <main className="w-100 h-[full]">
      {error && <Error msg={error} onClose={clearError} />}
      {alert && <Alert msg={alert} onClose={clearAlert} />}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-10 h-10 border-t-4 border-b-4 border-[#d79920] rounded-full animate-spin"></div>
        </div>
      )}

      <div className="container min-h-screen max-w-[98%] lg:max-w-[90%] m-auto flex flex-wrap items-center p-[20px] lg:p-[60px]">
        <p className="leading-tight font-Agency text-[70px] sm:text-[90px] font-normal w-full">
          Bitcoin AiD Protocol
        </p>
        <div className="mt-[50px] w-full lg:max-w-[55%] max-w-[100%] border-l-2 border-[#282722] p-8 ">
          {poolBalanceValue ? (
            <p className="font-semibold text-[35px] lg:text-[46px] w-full">
              {Number(ethers.formatEther(poolBalanceValue)).toFixed(2)}
              <span className="text-[#d79920]">BTCA</span>
            </p>
          ) : (
            <p className="font-semibold text-[35px] lg:text-[46px] w-full">
              ----- <span className="text-[#d79920]">BTCA</span>
            </p>
          )}
          <p className="text-[#d79920] text-[13px] lg:text-[18px] font-semibold ">
            Donation Pool
          </p>
        </div>
        <div className="mt-[30px] lg:mt-[50px] w-[100%] md:w-[45%] border-l-2 border-[#282722] p-8 ">
          <p className="font-semibold text-[35px] lg:text-[46px] w-full ">
            ${tokenPrice}
          </p>
          <p className="text-[#d79920] text-[13px] lg:text-[18px] font-semibold">
            1 BTCA Price
          </p>
        </div>

        <div className="btn-days w-full">
          {isFifteenDays ? (
            <div className="mt-[50px]">
              <button className="shadow-lg glossy_cta hover:bg-[#b7831c]  mr-[15px] bg-[#d79920] px-[20px] py-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] sm:text-[15px] font-semibold">
                <p className=" sm:text-[20px] text-[16px] font-semibold">
                  15 Days
                </p>
              </button>
              <button
                onClick={toggle}
                className=" px-[20px] py-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] sm:text-[15px] font-semibold"
              >
                <p className="sm:text-[20px] text-[16px] font-semibold">
                  30 Days
                </p>
              </button>
            </div>
          ) : (
            <div className="mt-[50px]">
              <button
                onClick={toggle}
                className=" px-[20px] py-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] sm:text-[15px] font-semibold"
              >
                <p className="sm:text-[20px] text-[16px] font-semibold">
                  15 Days
                </p>
              </button>
              <button className="shadow-lg glossy_cta hover:bg-[#b7831c] ml-[15px] bg-[#d79920] px-[20px] py-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] sm:text-[15px] font-semibold">
                <p className="sm:text-[20px] text-[16px] font-semibold">
                  30 Days
                </p>
              </button>
            </div>
          )}
        </div>
        <div className="mb-[50px] flex flex-wrap justify-center items-center cards w-[100%] mt-[50px]">
          <div className="max-w-[700px] p-[20px] bg-gradient-to-t from-[#201f1b] to-[#434139] w-[100%] md:w-[98%] lg:w-[45%] border-2 border-[#d79920] rounded-[3rem] lg:mr-[40px]">
            <div className="flex items-center">
              <Image
                src="/images/LogoBTCA-PNG.png"
                alt="Logo Btca"
                width={150}
                height={150}
                className="max-w-[25%] max-h-[25%]"
              />
              <p className="text-[30px] font-semibold">Contribute BTCA</p>
            </div>

            <div className="flex flex-col justify-between m-auto w-[100%] sm:w-[95%] h-[300px] bg-[#434139] rounded-3xl mb-[20px]">
              <div className="pt-[30px] flex flex-col items-center justify-center">
                {address ? (
                  balanceValue !== null ? (
                    <>
                      <p className="text-[25px]">Wallet Balance</p>
                      <span className="font-semibold text-[22px]">
                        {" "}
                        {Number(ethers.formatEther(balanceValue)).toFixed(
                          2
                        )}{" "}
                        BTCA
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="text-[25px]">Wallet Balance</p>
                      <p className="text-[22px] font-semibold">00.0000 BTCA</p>
                    </>
                  )
                ) : (
                  <>
                    <p className="text-[25px]">Wallet Balance</p>
                    <p className="text-[22px] font-semibold">---- BTCA</p>
                  </>
                )}
                <p className="text-[16px] text-[#eda921]">
                  $
                  {(
                    Number(ethers.formatEther(balanceValue)) * tokenPrice
                  ).toFixed(2)}
                </p>
                {userBalanceValue !== undefined && userBalanceValue !== null ? (
                  <>
                    <p className="text-[25px] mt-[14px]">Total Contributed</p>
                    <span className="font-semibold text-[22px]">
                      {(Number(userBalanceValue) / 1000000).toFixed(2)} $
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-[22px] mt-[20px]">Total Contributed</p>
                    <p className="text-[22px] font-semibold">
                      ---- <span className="">BTCA</span>
                    </p>
                  </>
                )}
              </div>
              <div className="flex justify-center items-end pb-[20px]">
                <button
                  onClick={openDonate}
                  className="shadow-lg glossy_cta hover:bg-[#b7831c] rounded-3xl text-[24px] md:text-[30px] font-Agency w-[80%] bg-[#d79920]"
                >
                  Contribute Now +
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-[700px] p-[20px] bg-gradient-to-t from-[#201f1b] to-[#434139] w-[100%] md:w-[98%] md:mb-[0px] mb-[40px] lg:w-[45%] border-2 border-[#3a6e01] rounded-[3rem] lg:mr-[40px] mt-[30px] lg:mt-[0px]">
            <div className="flex items-center">
              <Image
                src="/images/LogoBTCA-PNG.png"
                alt="Logo Btca"
                width={150}
                height={150}
                className="max-w-[25%] max-h-[25%]"
              />
              <p className="text-[30px] font-semibold">Claim BTCA</p>
            </div>

            <div className="flex justify-between flex-col items-center mb-[20px] m-auto w-[100%] sm:w-[95%] h-[300px] bg-[#434139] rounded-3xl">
              <div className="pt-[30px]">
                <p className="text-[25px] font-semibold">CLAIMABLE REWARDS</p>
                {userBalanceValue !== undefined && userBalanceValue !== null ? (
                  <>
                    <p className="font-Agency text-center text-[45px] mt-[15px]">
                      {balanceClaimed.toFixed(2)}
                      <span className="text-[#d79920]">$</span>
                    </p>
                    <p className="font-Agency text-center text-[20px] mt-[-15px]">
                      {(balanceClaimed / tokenPrice).toFixed(2)} BTCA
                    </p>
                  </>
                ) : (
                  <p className="font-Agency text-center text-[45px] mt-[15px]">
                    ---- <span className="text-[#d79920]">$</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col justify-end items-center pb-[20px] w-full">
                <p className="text-center mb-[2px]">Time to Claim</p>
                {time !== 0 ||
                userBalanceValue == 0 ||
                userBalanceValue == undefined ? (
                  <>
                    <p className="text-center mb-[10px]">
                      {Math.floor(time / 86400)}D:{" "}
                      {Math.floor((time % 86400) / 3600)}H:{" "}
                      {Math.floor((time % 3600) / 60)}M: {Math.floor(time % 60)}
                      S
                    </p>
                    <button className="cursor-default rounded-3xl text-[30px] font-Agency w-[80%] border-2 border-gray">
                      <p className="text-gray text-[24px] md:text-[30px]">
                        CLAIM
                      </p>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-center mb-[10px]">00D:00H:00M:00S</p>
                    <button
                      onClick={doClaim}
                      className="rounded-3xl text-[30px] font-Agency w-[80%] border-2 border-[#3a6e01] hover:bg-[#424039]"
                    >
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
          <div
            className="fixed inset-0 bg-black opacity-80"
            onClick={openDonate}
          ></div>
          <div className="relative bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <button
              className="absolute top-4 right-4 text-red-600"
              onClick={openDonate}
            >
              <p className="font-bold">X</p>
            </button>
            <p className="text-center text-white text-[23px]">
              Contributing <span className="text-[#eda921]">BTCA</span>
            </p>
            {address ? (
              <>
                <input
                  onChange={(e) => setValue(e.target.value)}
                  value={value}
                  className="w-full m-w-[90%] p-2 bg-[#33322d] rounded-3xl mt-[20px] focus:outline-none focus:border-2 focus:border-[#eda921]"
                  type="number"
                  placeholder={Number(ethers.formatEther(balanceValue)).toFixed(
                    2
                  )}
                ></input>
                <button
                  onClick={handleMaxClick}
                  className="text-[#eda921] ml-[10px] font-bold mt-[3px]"
                >
                  MAX
                </button>
                <p className="flex items-end justify-end mt-[-23px] mr-[15px]">
                  ${Math.floor((Number(value) * tokenPrice) * 100) / 100}
                </p>
                <div className="w-full flex flex-col items-center mb-[15px] mt-[10px]">
                  {Number(allowance) >= Number(value) ? (
                    <button
                      onClick={Donate}
                      className="w-[150px] font-semibold rounded-3xl bg-[#eda921] p-[8px] glossy_cta"
                    >
                      Contribute
                    </button>
                  ) : verifyAddress(address) ? (
                    <button
                      onClick={handleApproveOpen}
                      className="w-[150px] font-semibold rounded-3xl bg-[#eda921] p-[8px] glossy_cta"
                    >
                      Approve
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center justify-center mt-[20px] text-[12px] py-[10px] px-[20px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] hover:px-[22px] hover:py-[12] sm:text-[15px] font-semibold mx-auto"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      ) : (
        ""
      )}

      {aproveOpen ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-80"
            onClick={handleApproveOpen}
          ></div>
          <div className="relative items-center justify-center flex bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            {verifyAddress(address) ? (
              <>
                <div className="w-[100%] flex items-center justify-center flex-col">
                  <TbLockAccess className="border-2 text-[80px] rounded-full p-[20px] border-white" />
                  <p className="font-Agency text-[35px] mt-[10px]">
                    Unlock AiD Token
                  </p>
                  <p className="text-center text-[18px] mt-[6px]">
                    We need your permission to move {balanceClaimed} AiD on your
                    behalf
                  </p>
                  <button
                    onClick={() => approveToken(address, Number(value))}
                    className=" font-semibold rounded-3xl bg-[#eda921] px-[30px] py-[12px] my-[20px]"
                  >
                    Approve {value} Aid
                  </button>
                </div>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </main>
  );
}
