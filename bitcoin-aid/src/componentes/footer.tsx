"use client"
import Link from "next/link"
import { MdHome } from "react-icons/md";
import { MdDashboard } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { RiNftFill } from "react-icons/ri";
import { usePathname } from "next/navigation";
export default function Footer(){
    
    const pathname = usePathname();

    const isActive = (pathName:string) => pathname === pathName;

    return(
<footer className="bg-[#201f1b] border-t-2 border-[#eda921] p-2 w-full h-[65px] mb-0 fixed bottom-0">
  <div className="container max-w-[1400px] w-[95%] flex flex-row mx-auto mt-[5px]">
    <div className="w-[25%]">
    <Link href="/" className="flex flex-col items-center">
      <MdHome className="text-[18px] md:text-[20px]"/>
      <p className={isActive('/') ? 'text-yellow-500' : 'text-white'}>Home</p>
    </Link>
    </div>
    
    <div className="w-[25%]">
    <Link href="/nft" className="flex flex-col items-center">
      <MdDashboard className="text-[18px] md:text-[20px]"/>
      <p className={isActive('/nft') ? 'text-yellow-500' : 'text-white'}>NFT's</p>
    </Link>
    </div>

    <div className="w-[25%]">
    <Link href="/dashboard" className="flex flex-col items-center">
      <RiNftFill className=" text-[18px] md:text-[20px]"/>
      <p className={isActive('/dashboard') ? 'text-yellow-500' : 'text-white'}>Profile</p>
    </Link>
    </div>

    <div className="w-[25%]">
    <Link href="/" className="flex flex-col items-center">
      <IoDocumentText className=" text-[18px] md:text-[20px]"/>
      <p className="">About</p>
    </Link>
    </div>
  </div>
</footer>
    )
}