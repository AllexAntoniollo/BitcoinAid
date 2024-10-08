"use client";
import Image from "next/image";
import { FaRegSadTear } from "react-icons/fa";
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
import Error from "@/componentes/erro";
import Alert from "@/componentes/alert";

export default function Dashboard() {
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const { address } = useWallet();
  const [nftByBatch, setNftByBatch] = useState<number[]>();
  const [donationReward, setDonationReward] = useState<bigint>(BigInt(0));
  const [nftReward, setNftReward] = useState<bigint>(BigInt(0));
  const [btcaReward, setBtcaReward] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [temNft, setTemNft] = useState<boolean>(false);
  const [claimOpen, setClaimOpen] = useState<boolean>(false); 

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

  async function handleClaimOpen() {
    setClaimOpen(prevValue => !prevValue);
  }

  async function handleClaim() {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      setAlert(""); // Clear any previous alerts

      if (address) {
        await claimBtcaQueue();
        fetchRewards();
        setAlert("Claim successful!"); // Success alert
      }
    } catch (err: any) {
      setError(err.reason || "An error occurred during the claim."); // Capture error reason
      console.error("Error claiming BTCA:", err);
    } finally {
      setLoading(false);
    }
  }
  const clearError = () => {
    setError("");
  };

  const clearAlert = () => {
    setAlert("");
  };
  useEffect(() => {
    fetchRewards();
  }, [address]);

  useEffect(() => {
    if (nftByBatch && nftByBatch.some(value => value > 0)) {
      setTemNft(true);
    } else {
      setTemNft(false);
    }
  }, [nftByBatch]);
  

  return (
    <>
      {error && <Error msg={error} onClose={clearError} />}
      {alert && <Alert msg={alert} onClose={clearAlert} />}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-10 h-10 border-t-4 border-b-4 border-[#d79920] rounded-full animate-spin"></div>
        </div>
      )}
      <div className="w-full sm:max-w-[90%] max-w-[98%] m-auto p-4 h-full">
        <div className="container max-w-[1400px] w-[98%] m-auto h-full">
          <div className="z-5 relative shadow-lg shadow-black flex flex-col items-center w-[90%] p-[20px] max-w-[700px] mx-auto rounded-3xl mt-[30px]">
              {address?(
                 <p className="md:text-[26px] text-[20px] font-semibold">User: <span>{`${address.slice(0, 10)}...${address?.slice(-8)}`}</span></p>
              ):(
                <p className="md:text-[26px] text-[20px] font-semibold">User: </p>
              )}
            
            <p className="md:text-[80px] text-[50px] font-bold text-[#3a6e01]">
              {String(donationReward / BigInt(10 ** 6))}$
            </p>
            <p className="md:text-[22px] text-[18px] font-semibold text-white mt-[-10px]">
              Donation Rewards
            </p>
            <p className="md:text-[80px] text-[50px] font-bold text-[#3a6e01]">
              {String(nftReward / BigInt(10 ** 6))}$
            </p>

            <p className="md:text-[22px] text-[18px] font-semibold text-white">
              Nft Rewards
            </p>
          </div>

          <div className="your_nft w-full mt-12 text-center flex items-center justify-center flex-col">
  <div className="mb-24 glossy lg:w-2/5 md:w-3/5 sm:w-4/5 p-5 flex items-center justify-center flex-col rounded-2xl">
    <p className="text-2xl m-auto font-semibold mb-2">
      - Your NFTs out of the queue -
    </p>
    <Image
      src="/images/NFTSATOSHI.png"
      alt="NFT"
      layout="responsive"
      width={300}
      height={300}
      className="mx-auto max-w-[60%] max-h-[55%]"
    />

    <div className="mt-4 w-[90%]">
      <p className="font-semibold text-xl">You Have</p>
      <div className="h-40 overflow-y-scroll w-full relative">
      {nftByBatch?.map((value, index) => {
  // Chame a função hasNft() se o valor for maior que 

        return value > 0 ? (
          <p key={index} className="p-2">
            Batch #{index + 1}: {value.toString()} NFT's
          </p>
        ) : null;
      })}

      {temNft?(
        ""
      ):(
        <>
        <div className="flex flex-col items-center justify-center p-[12px] mt-[10px]">
          <FaRegSadTear className="text-[40px] text-red-700"></FaRegSadTear>
          <p>Sorry</p>
          <p>You don't have Nft's</p>
        </div>
        </>
      )}

      </div>
    </div>
  </div>
</div>

          <div className="border border-[#448301] rounded mx-auto p-7 text-center text-3xl bg-[#171717]">
            <p>Withdraw your nft rewards not claimed</p>
          </div>

          <div className="border border-[#448301] my-10 rounded mx-auto p-7 text-center text-3xl bg-[#171717] mb-[120px]">
            <div className="flex w-full">
              <p>Total BTCA:</p>
              <p>{String(btcaReward / BigInt(10 ** 18))}</p>
            </div>
            {btcaReward?(
              <button
              onClick={handleClaimOpen}
              className="glossy_claim hover:bg-[#346301] mx-auto p-[10px] w-[200px] rounded-full mt-[10px] glossy_cta"
            >
              Claim Now
            </button>
            ):(
              <button
              className="cursor-not-allowed mx-auto p-[10px] w-[200px] rounded-full mt-[10px] border-2 border-white"
              >
              Claim Now
              </button>
            )}
            
          </div>
        </div>
      </div>
      
      
  {claimOpen || btcaReward?(
    <div className="fixed inset-0 flex items-center justify-center z-50">
    <div
      className="fixed inset-0 bg-black opacity-90"
      onClick={handleClaimOpen}
    ></div>
    <div className="relative bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[90%] max-w-lg z-10 glossy">
      <button
        className="absolute top-4 right-4 text-red-600"
        onClick={handleClaimOpen}
      >
        <p className="font-bold">X</p>
      </button>
      <div className="w-[100%] items-center justify-center text-center">
        <p className="font-semibold text-[26px] items-center justify-center text-green-500">Be happy!</p>
        <p className="text-[22px] text-center"> While you were away your NFTs generated income for you</p>
        <Image
        src="/images/NFTSATOSHI.png"
        alt="NFT"
        layout="responsive"
        width={300}
        height={300}
        className="mx-auto max-w-[60%] max-h-[55%]"
        />

        <p className="mt-[20px] text-[22px] font-semibold">You Have {String(btcaReward / BigInt(10 ** 18))} BTCA to Withdraw</p>
      </div>
      <button
          onClick={handleClaim}
          className="flex m-auto items-center justify-center glossy_claim hover:bg-[#346301] mx-auto p-[10px] w-[200px] rounded-full mt-[10px] glossy_cta"
        >
          Claim Now
        </button>
      </div>
      </div>
  ):(
    ""
  )}
        
    </>
    
  );
}
