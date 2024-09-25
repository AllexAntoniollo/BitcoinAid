"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { doLogin } from "@/services/Web3Services";
import Link from "next/link";
import { useWallet } from "@/services/walletContext";
import { MdLogout } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { PiUserSwitchLight } from "react-icons/pi";

export default function Header() {
  const { address, setAddress } = useWallet();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [accountMenu, setAccountMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null); // Referência para o menu
  const [walletAddress, setWalletAddress] = useState<string | null>(null);



  const handleClickOutside = (event: MouseEvent) => {
    // Verifica se o clique ocorreu fora do menu
    if (menuRef.current && !(event.target instanceof Node) || !menuRef.current?.contains(event.target as Node)) {
      setAccountMenu(false);
    }
  };

  useEffect(() => {
    // Adiciona o listener de clique
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Remove o listener ao desmontar o componente
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const copyToClipboard = (text:string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Texto copiado para a área de transferência!');
      })
      .catch((err) => {
        console.error('Falha ao copiar o texto: ', err);
      });
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

  const openAccountMenu = () => {
    setAccountMenu(prevState => !prevState);
  }

  const handleDisconnect = () => {
      setWalletAddress(null); // Limpa o estado da conta conectada
  
      // Remove todas as variáveis do localStorage relacionadas à conexão
      localStorage.removeItem('userAddress'); // Adicione outras chaves conforme necessário
  
      // Recarrega a página
      window.location.reload();
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

  
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]); // Conecta a carteira
        } catch (error) {
          console.error("Erro ao conectar a carteira:", error);
        }
      } else {
        console.error("MetaMask não está instalada");
      }
    };
  
    const switchAccount = async () => {
      if (window.ethereum) {
        try {
          // Isso solicita que o usuário escolha uma conta
          const permissions = await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
    
          // Verifica as contas novamente após a permissão ser solicitada
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setWalletAddress(accounts[0]); // Atualiza a conta conectada
        } catch (error) {
          console.error("Erro ao trocar de conta:", error);
        }
      }
    };
  
    useEffect(() => {
      // Escuta por mudanças de conta
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]); // Atualiza a conta ao mudar
          } else {
            setAddress(null); // Caso não haja contas conectadas
          }
        });
      }
  
      return () => {
        // Remove o listener quando o componente é desmontado
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', () => {});
        }
      };
    }, []);



  useEffect(() => {
    if (address) {
      localStorage.setItem('userAddress', address);
    }
  }, [address]);

  return (
    <header className="bg-[#201f1b] border-b-4 border-[#eda921] p-1 h-[70px] flex justify-center">
      <div className="container sm:max-w-[90%] m-auto flex items-center max-w-[98%]">
        <a className="flex flex-row w-[50%] items-center cursor-pointer" href="/">
        <Image src="/images/LogoBTCA-PNG.png" alt="Logo Btca" width={70} height={70} className="max-w-[60px] max-h-[60px]" />
        <p className="font-Agency text-[18px] sm:text-[22px]">BTCAiD</p>
        </a>
        <div className="ml-auto flex items-center">
          {address ? (
            <>
            <button onClick={openAccountMenu} className="shadow-sm shadow-black px-[12px] py-[5px] cursor-pointer text-[#eda921]">{`${address.slice(0, 6)}...${address.slice(-4)}`}</button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              className="text-[12px] p-[8px] border-2 rounded-full border-[#eda921] transition-all duration-300 hover:border-[#bb8312] hover:p-[10px] sm:text-[15px] font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {accountMenu ? (
          <>
          <div ref={menuRef} className="z-999 right-[20px] items-center justify-center  top-[40px] md:top-[70px] absolute w-[250px] bg-[#201f1b] shadow-lg shadow-black">
            <div className="w-[95%] h-[95%] border-2 border-[#eda921] m-auto mt-[8px] flex flex-col justify-between ">
              <div className="flex flex-row border-b-2 border-white items-center justify-center">
                <p className="flex items-center justify-center p-[8px]">{`${address?.slice(0,6)}...${address?.slice(-4)}`}</p>
                <button onClick={() => copyToClipboard(address?address : "")} className="copy-button">
                  <FaCopy className="text-[15px]"></FaCopy>
                </button>
              </div>
              <button onClick={switchAccount} className="w-[100%] flex items-center justify-center border-b-[1px] p-[8px] border-white">Switch Account <PiUserSwitchLight className="text-white font-[25px] ml-[5px]"/></button>
              <div onClick={handleDisconnect} className="cursor-pointer flex items-center justify-center p-[10px]">

                <button className="text-red-600 flex items-center font-semibold">Disconnect</button>
                <MdLogout className="ml-[5px] text-red-600"></MdLogout>
              </div>
            </div>
          </div>
          
          </>
        ):(
          ""
        )}
      </div>
    </header>
  );
}
