"use client";
import Image from "next/image";
import {
  getCurrentBatch,
  getNftUserByBatch,
  getTotalDonationReward,
  getTotalNftReward,
  getTotalBtcaToClaim,
  claimBtcaQueue,
} from "@/services/Web3Services";
import { useEffect, useState } from "react";
import { useWallet } from "@/services/walletContext";

export default function Dashboard() {
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const { address } = useWallet();
  const [nftByBatch, setNftByBatch] = useState<number[]>();
  const [donationReward, setDonationReward] = useState<bigint>(BigInt(0));
  const [nftReward, setNftReward] = useState<bigint>(BigInt(0));
  const [btcaReward, setBtcaReward] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);

  async function getNftUser() {
    const result = await getCurrentBatch();
    setCurrentBatch(result);
    const nfts: number[] = [];
    if (address) {
      for (let i = 1; i <= result; i++) {
        const value = await getNftUserByBatch(address, i);
        nfts.push(value);
      }
    }
    setNftByBatch(nfts);
  }

  async function fetchRewards() {
    if (address) {
      const donation = await getTotalDonationReward();
      setDonationReward(donation);

      const nft = await getTotalNftReward();
      setNftReward(nft);

      const btca = await getTotalBtcaToClaim();
      setBtcaReward(btca);

      await getNftUser();
    }
  }

  async function handleClaim() {
    try {
      setLoading(true);

      if (address) {
        await claimBtcaQueue();
        fetchRewards();
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

      console.error("Error claiming BTCA:", error);
    }
  }

  useEffect(() => {
    fetchRewards();
  }, [address]);

  return (
    <div className="w-full sm:max-w-[90%] max-w-[98%] m-auto p-4 h-full">
      <div className="container max-w-[1400px] w-[98%] m-auto h-full">
        <div className="z-5 relative shadow-lg shadow-black flex flex-col items-center w-[90%] p-[20px] max-w-[700px] mx-auto rounded-3xl mt-[30px]">
          <p className="md:text-[26px] text-[20px] font-semibold">
            User: {`${address?.slice(0, 10)}...${address?.slice(-8)}`}
          </p>
          <p className="md:text-[80px] text-[50px] font-bold text-[#3a6e01]">
            {String(donationReward / BigInt(10 ** 6))}$
          </p>
          <p className="md:text-[80px] text-[50px] font-bold text-[#3a6e01]">
            {String(nftReward / BigInt(10 ** 6))}$
          </p>

          <p className="md:text-[22px] text-[18px] font-semibold text-white md:mt-[-25px] mt-[-10px]">
            Nft Rewards
          </p>
        </div>

        <div className="your_nft w-[100%] mt-[50px] text-center flex items-center justify-center flex-col">
          <div className="mb-[100px] glossy lg:w-[40%] md:w-[60%] sm:w-[80%] p-[20px] flex items-center justify-center flex-col rounded-2xl">
            <p className="text-[30px] m-auto font-semibold mb-[10px]">
              - Your nfts out of the queue -
            </p>
            <Image
              src="/images/NFTSATOSHI.png"
              alt="NFT"
              layout="responsive"
              width={300}
              height={300}
              className="mx-auto max-w-[60%] max-h-[55%]"
            />

            <div className="mt-[15px]">
              <p className="font-semibold text-[22px]">You Have</p>
              <div className="max-h-40">
                {nftByBatch?.map((value, index) =>
                  value > 0 ? (
                    <p key={index} className="p-[8px]">
                      Batch #{index + 1}: {value.toString()} NFT's
                    </p>
                  ) : (
                    ""
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded mx-auto p-7 text-center text-3xl bg-[#1D1F31]">
          <p>Withdraw your nft rewards not claimed</p>
        </div>

        <div className="border my-10 rounded mx-auto p-7 text-center text-3xl bg-[#1D1F31]">
          <div className="flex w-full">
            <p>Total BTCA:</p>
            <p>{String(btcaReward / BigInt(10 ** 18))}</p>
          </div>
          <button
            onClick={handleClaim}
            className="hover:bg-[#a47618] mx-auto p-[10px] w-[200px] bg-[#d79920] rounded-full mt-[10px] glossy_cta"
          >
            Claim Now
          </button>
        </div>
      </div>
    </div>
  );
}
