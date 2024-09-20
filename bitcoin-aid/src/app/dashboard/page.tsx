"use client"
import Image from "next/image";
import { getCurrentBatch } from "@/services/Web3Services";
import { useEffect, useState } from "react";
import { useWallet } from "@/services/walletContext";

export default function dashboard(){

    const [currentBatch, setCurrentBatch] = useState<number>(0);
    const { address, setAddress } = useWallet();

    useEffect (() => {
        const current = getCurrentBatch();
        setCurrentBatch(Number(current));
        
    })

    return(
        <div className=" w-full sm:max-w-[90%] max-w-[98%] m-auto p-4 ">
            <div className="container max-w-[1400px] w-[98%] m-auto">
                <div className="w-[90%] max-w-[700px] h-[400px] glossy_cta m-auto rounded-3xl mt-[30px]">

                </div>

                <div className="your_nft w-[100%] mt-[50px] text-center h-[400px]">
                    <p className="text-[30px] m-auto font-semibold">- Your Nft's by Batch -</p>
                    

                    <div className="glossy-content flex items-center justify-center flex-col">
                    <Image
                        src="/images/NFTSATOSHI.png"
                         alt="NFT"
                        width={300}
                        height={300}
                        className="mx-auto max-w-[60%] max-h-[55%]"
                    ></Image>
                    </div>
                </div>
            </div>
        </div> 
    );
}