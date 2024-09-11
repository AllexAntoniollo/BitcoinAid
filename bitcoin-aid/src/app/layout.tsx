import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import "./globals.css";
import Header from "../componentes/header";
import { WalletProvider } from "@/services/walletContext";

const franklin = Libre_Franklin({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>BTCA</title>
        <link rel="icon" href="/images/LogoBTCA-PNG.png" />
      </head>
      <body className="bg-[#1b1a16]">
        <WalletProvider> {/* Envolva o conteúdo com o WalletProvider */}
          <Header />
          <main className={franklin.className}>{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
