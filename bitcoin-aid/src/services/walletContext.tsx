"use client"
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define o tipo de contexto
interface WalletContextProps {
  address: string | null;
  setAddress: (address: string | null) => void;
}

// Cria o contexto
const WalletContext = createContext<WalletContextProps | undefined>(undefined);

// Provedor do contexto
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);

  return (
    <WalletContext.Provider value={{ address, setAddress }}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook para usar o contexto
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet deve ser usado dentro de um WalletProvider");
  }
  return context;
};
