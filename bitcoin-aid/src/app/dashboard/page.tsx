"use client"
import Image from "next/image";
import { 
    getCurrentBatch,
    getNftUserByBatch,

 } from "@/services/Web3Services";
import { useEffect, useState } from "react";
import { useWallet } from "@/services/walletContext";
export default function dashboard(){

    const [currentBatch, setCurrentBatch] = useState<number>(0);
    const { address, setAddress } = useWallet();
    const [nftByBatch, setNftByBatch] = useState<number[]>();


    async function getNftUser(){
        const result = await getCurrentBatch();
        setCurrentBatch(result);
        const nfts:number[] = [];;
        if(address){
            for(let i = 1; i <= result;i++){    
                const value = await getNftUserByBatch(address, i);
                nfts.push(value);
            }
        }
        setNftByBatch(nfts);
    }

    useEffect (() => {
        getNftUser();
    }, [address])

    return(
        <div className=" w-full sm:max-w-[90%] max-w-[98%] m-auto p-4 h-full">
            <div className="container max-w-[1400px] w-[98%] m-auto h-[full]">
                <div className="w-[90%] max-w-[700px] h-[400px] glossy_cta m-auto rounded-3xl mt-[30px]">

                </div>

                <div className="your_nft w-[100%] mt-[50px] text-center flex items-center justify-center flex-col">

                    <div className="mb-[100px] glossy w-[40%] p-[20px] flex items-center justify-center flex-col rounded-2xl">
                    <p className="text-[30px] m-auto font-semibold mb-[10px]">- Your nfts out of the queue -</p>
                    <Image
                        src="/images/NFTSATOSHI.png"
                         alt="NFT"
                        width={300}
                        height={300}
                        className="mx-auto max-w-[60%] max-h-[55%]"
                    ></Image>
                    <div className=" mt-[15px]">
                        <p className="font-semibold text-[22px]">You Have</p>
                    {nftByBatch?.map((value, index) =>(
                            <p className="p-[8px]">Lote #{index+1}: {value.toString()} NFT's</p>
                    ))}
                    </div>
                    </div>
                </div>
            </div>
        </div> 
    );
}