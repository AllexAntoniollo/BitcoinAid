import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import "./globals.css";
import Header from "../componentes/header";
import Footer from "@/componentes/footer";
import { WalletProvider } from "@/services/walletContext";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/react";
import { FaTelegramPlane } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
const franklin = Libre_Franklin({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BTCA",
  description: "Innovative system of fair income distribution.",
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
      <body className="bg-gradient-to-t to-[#201f1b] from-[#000000]">
        <Image alt="bg" src={'/images/World.png'} width={1000} height={1000} className="absolute z-[-1] opacity-[20%]"></Image>
        <WalletProvider> {/* Envolva o conteúdo com o WalletProvider */}
          <Header />
          <Analytics />
          <main className={franklin.className}>{children}</main>
          <a href="https://t.me/+JbfwsxCsJYwyM2Zh" target="_blank">
           <div className="fixed md:bottom-[90px] bottom-[80px] right-[2%] bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition transform hover:scale-110">
              <FaTelegramPlane className="md:w-6 md:h-6 w-4 h-4" />
           </div>
          </a>

          <a href="https://chat.whatsapp.com/FEUqYqQFIIR50DdWB1gpxj" target="_blank">
           <div className="fixed md:bottom-[140px] bottom-[120px] right-[2%] bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-110">
              <FaWhatsapp className="md:w-6 md:h-6 w-4 h-4" />
           </div>
          </a>

          <Footer/>
        </WalletProvider>
      </body>
    </html>
  );
}
