"use client";
import { TbLockAccess } from "react-icons/tb";
import { useEffect } from "react";
import { useState } from "react";
import { useWallet } from "@/services/walletContext";
import Slider from "react-slick";
import Error from "@/componentes/erro";
import Alert from "@/componentes/alert";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  getQueue,
  getCurrentBatch,
  addQueue,
  mintNft,
  nftPrice,
  approveMint,
  nextToPaid,
  balanceFree,
  totalNfts,
  isApproveToQueue,
  approveToAll,
  haveNft,
  claimQueue,
  totalMintedOnBatch,
} from "@/services/Web3Services";
import { nftQueue } from "@/services/types";
import { blockData } from "@/services/types";
import Image from "next/image";
import { BlockList } from "net";

const SimpleSlider = () => {
  const [loading, setLoading] = useState(false);
  const [queueData, setQueueData] = useState<nftQueue[][]>([]);
  const [blockData, setBlockData] = useState<blockData[][]>([]);
  const [nextPaid, setNextPaid] = useState<nftQueue[]>();
  const [balance, setBalance] = useState<number>();
  const [valuesNextFour, setValuesNextFour] = useState<number[]>([]);
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const [addNftOpen, setNftAddOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number | "">("");
  const [nftCurrentPrice, setNftCurrentPrice] = useState<number>(0);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const { address, setAddress } = useWallet();
  const [approveToMint, setApproveToMint] = useState<boolean>(false);
  const [approveToMintOpen, setApproveToMintOpen] = useState<boolean>(false);
  const [approveQueue, setApproveQueue] = useState<boolean>(false);
  const [minted, setMinted] = useState<number>(0);

  async function doClaimQueue(index: number, queueId: number) {
    if (address) {
      try {
        setLoading(true);
        const result = await claimQueue(index, queueId);
        if (result) {
          setLoading(false);
          setAlert(
            "Be happy! Your NFTs have already deposited their earnings into your wallet"
          );
          fetchQueue();
          nextFour();
        }
      } catch (err: any) {
        setLoading(false);

        setError("Ops! Something went wrong: " + err.reason);
      }
    }
  }

  async function totalSendInBatch() {
    try {
      const result = await totalMintedOnBatch();
      setMinted(Number(result));
    } catch (err) {
      ("");
    }
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Converte o valor para um número, se possível
    const value = event.target.value;
    const numericValue = value === "" ? "" : Number(value);
    setInputValue(numericValue);
  };

  const handleApproveQueueOpen = () => {
    setApproveQueue(false);
    setNftAddOpen(false);
  };

  async function doApproveNft() {
    setLoading(true);
    setApproveQueue(false);
    setApproveToMint(false);
    try {
      if (address) {
        await approveToAll();
        setLoading(false);
        setAlert("Very good! Now you can add your NFTs to the queues");
      }
    } catch (err: any) {
      setLoading(false);
      setError("Something went wrong: " + err.reason);
    }
  }

  async function isApprovedForAll() {
    if (address) {
      const result = await isApproveToQueue(address);
      if (result) {
        setNftAddOpen(true);
      } else {
        setApproveQueue(true);
      }
    } else {
      setError("You need to connect wallet to interact with the project");
    }
  }

  async function nextFour() {
    const total = await totalNfts();
    if (total >= 4) {
      const result = await nextToPaid();
      let getBalance = await balanceFree();
      let balance = parseInt(getBalance) / Math.pow(10, 18);
      console.log("Tem %d aid disponivel pras nft", balance);

      let valueNextFour = [];
      let nextPaidArray = [];
      setBalance(balance);
      for (let i = 0; i < Math.min(result.length, 4); i++) {
        let willReceived = 0;
        const lote = result[i].batchLevel;
        const batchDecimal = Number(lote) % 10;
        if (batchDecimal == 0) {
          valueNextFour.push(5120 * 3);
        } else {
          willReceived = 10;
          for (let j = 1; j < batchDecimal; j++) {
            willReceived = willReceived * 2;
          }
          willReceived = willReceived * 3;
        }
        valueNextFour.push(willReceived);
      }
      for (let k = 0; k < 4; k++) {
        balance -= valueNextFour[k];
        console.log("balance atual", balance);
        if (balance > 0) {
          nextPaidArray.push(result[k]);
        }
      }
      setNextPaid(nextPaidArray);
    } else {
      let dontNextPaied = undefined;
      setNextPaid(dontNextPaied);
    }
  }

  async function verificaPaied() {
    const flattenedArray: blockData[][] = [];
    for (let i = 0; i < queueData.length; i++) {
      // Inicializa o array para cada `i`
      flattenedArray[i] = [];

      for (let j = 0; j < queueData[i].length; j++) {
        const item = queueData[i][j];
        const isPaied = nextPaid
          ? nextPaid.some((next) => next.index === item.index)
          : false;
        // Atribua um novo objeto no índice apropriado
        flattenedArray[i][j] = {
          user: item.user,
          index: item.index,
          batchLevel: item.batchLevel,
          nextPaied: isPaied,
        };
      }
    }

    console.log("Atualizando blockData:", flattenedArray);
    setBlockData(flattenedArray);
  }

  function youWillRecieved(value: number) {
    const batchDecimal = value % 10;
    let willReceived = 0;
    if (value != 0) {
      if (batchDecimal == 0) {
        willReceived = 5120 * 3;
      } else {
        willReceived = 10;
        for (let j = 1; j < batchDecimal; j++) {
          willReceived = willReceived * 2;
        }
        willReceived = willReceived * 3;
      }
    } else {
      willReceived = 0;
    }

    return willReceived;
  }

  async function approveToMintNft(value: number) {
    try {
      setLoading(true);
      const priceInWei = BigInt(value) * BigInt(Math.pow(10, 18));
      const result = await approveMint(priceInWei);
      if (result) {
        setLoading(false);
        setAlert("Your NFT is now available in your wallet");
        setApproveToMint(true);
      }
    } catch (err: any) {
      setLoading(false);
      setError("Failed to buy nft: " + err.reason);
    }
  }

  const doApproveMint = () => {
    const priceInWei: number =
      Number(nftCurrentPrice) * Number(Math.pow(10, 6));
    console.log(priceInWei);
    if (address) {
      approveToMintNft(priceInWei);
    } else {
      setError("You need connect your wallet");
    }
  };

  const handleSubmit = async () => {
    if (Number(inputValue == 0)) {
      setNftAddOpen(false);
      setError("You must enter a valid batch");
    } else {
      if (address) {
        const result = await haveNft(address, Number(inputValue));
        if (result > 0) {
          setNftAddOpen(false);
          setLoading(true);
          try {
            const tx = await addQueue(Number(inputValue));
            if (tx) {
              setLoading(false);
              setAlert("Your nft has been successfully queued");
              fetchQueue();
              nextFour();
            }
          } catch (err: any) {
            setLoading(false);
            setError("Ops! Something went wrong: " + err.reason);
          }
        } else {
          setNftAddOpen(false);
          setError("You don't have any NFTs from this batch");
        }
      }
    }
  };

  const goApproveMint = () => {
    setApproveToMintOpen(true);
  };
  const handleApproveMintOpen = () => {
    setApproveToMintOpen((prevState) => !prevState);
  };
  const buyNft = async () => {
    try {
      setLoading(true);
      const result = await mintNft(1);
      if (result) {
        setLoading(false);
        setAlert("Congratulations on purchasing your NFT");
      } else {
        setError("Failed to purchase nft");
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setError("Failed to purchase nft: " + err.reason);
    }
  };

  async function getNftPrice(currentBatch: number) {
    try {
      const result = await nftPrice(currentBatch);
      setNftCurrentPrice(result);
    } catch (err: any) {
      setError("Failed on get NFT's price: " + err.reason);
    }
  }

  const clearError = () => {
    setError("");
  };
  const clearAlert = () => {
    setAlert("");
  };

  const fetchQueue = async () => {
    try {
      const result = await getCurrentBatch();
      setCurrentBatch(result);
      const promises = [];
      for (let i = 1; i <= result; i++) {
        promises.push(getQueue(i));
      }

      const results = await Promise.all(promises);
      setQueueData(results);
      console.log("resultado ", results);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchQueue();
      await nextFour();
    };
    totalSendInBatch();
    console.log("mintadas: %d", minted);
    fetchData();
  }, []);

  useEffect(() => {
    if (queueData.length > 0) {
      verificaPaied();
    }
  }, [queueData, nextPaid]);

  useEffect(() => {
    if (currentBatch) {
      getNftPrice(currentBatch);
    }
  }, [currentBatch]);

  const settings = (dataSetLength: number) => {
    const handleBeforeChange = (next: number) => {
      // Previne ir além do número total de slides
      if (next >= dataSetLength) {
        return false; // Impede a transição se o próximo slide ultrapassar o limite
      }
    };
    const maxSlidesToShow = 4;
    return {
      dots: true,
      infinite: false, // Desativa o loop infinito
      speed: 500,
      slidesToShow: Math.min(maxSlidesToShow, dataSetLength), // Mostra no máximo 4 slides ou menos
      slidesToScroll: 1, // Desliza no máximo 1 slide por vez
      adaptiveHeight: true,
      arrows: dataSetLength > maxSlidesToShow, // Exibe setas se houver mais que 4 slides
      swipe: true,
      touchMove: true,
      draggable: dataSetLength > 1,
      beforeChange: handleBeforeChange, // Permite arrastar se houver mais de 1 slide

      responsive: [
        {
          breakpoint: 1300,
          settings: {
            slidesToShow: Math.min(3, dataSetLength),
            slidesToScroll: 1,
            beforeChange: handleBeforeChange,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(3, dataSetLength),
            slidesToScroll: 1,
            beforeChange: handleBeforeChange,
          },
        },
        {
          breakpoint: 950,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            dots: false,
            arrows: false,
            beforeChange: handleBeforeChange,
          },
        },
      ],
    };
  };

  return (
    <>
      {error && <Error msg={error} onClose={clearError} />}
      {alert && <Alert msg={alert} onClose={clearAlert} />}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-10 h-10 border-t-4 border-b-4 border-[#d79920] rounded-full animate-spin"></div>
        </div>
      )}

      <div className=" w-full sm:max-w-[90%] max-w-[98%] m-auto sm:p-4">
        <p className="mt-[40px] mb-[40px] leading-tight font-Agency text-[50px] sm:text-[80px] font-normal w-full">
          Bitcoin AiD Protocol - NFT Payment Queue
        </p>
        <div className=" mx-auto lg:w-[35%] w-[90%] bg-[#26251f35] rounded-3xl mb-[10px] flex flex-col py-[30px] shadow-lg glossy">
          <div className="glossy-content flex items-center justify-center flex-col">
            <p className=" mx-auto text-[30px] mb-[8px]">
              {currentBatch ? `Buy NFT - Batch #${currentBatch}` : "Loading..."}
            </p>
            <Image
              src="/images/NFTSATOSHI.png"
              alt="NFT"
              width={1000}
              height={1000}
              className="mx-auto max-w-[60%] max-h-[55%]"
            ></Image>
            <p className="mx-auto text-[20px] mt-[10px] font-semibold">
              {nftCurrentPrice ? `${nftCurrentPrice}$` : "Loading..."}
            </p>
            {approveToMint ? (
              <button
                onClick={buyNft}
                className=" hover:bg-[#a47618] mx-auto p-[10px] w-[200px] bg-[#d79920] rounded-full mt-[10px] glossy_cta"
              >
                Buy Nft
              </button>
            ) : (
              <button
                onClick={goApproveMint}
                className=" hover:bg-[#a47618] mx-auto p-[10px] w-[200px] bg-[#d79920] rounded-full mt-[10px] glossy_cta"
              >
                Buy Nft
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-6 mb-[30px] mt-[25px]">
          <div className="mx-auto lg:w-[40%] w-full bg-[#26251f35] h-[200px] mt-[20px] flex flex-col justify-between items-center p-4  border-2 border-[#d79920]">
            <p className=" text-center text-[24px] mt-[20px]">
              Add your NFT's to Queue
            </p>
            <div className="w-full flex justify-center">
              <button
                onClick={isApprovedForAll}
                className="bg-[#d79920] w-[200px] p-[10px] rounded-full mb-[20px] glossy_cta hover:bg-[#a47618]"
              >
                <p className="text-[20px] font-semibold">Add NFT +</p>
              </button>
            </div>
          </div>
        </div>

        <div className="h-[300px] mx-auto max-w-[100%] overflow-y-auto slider-container p-2 mb-[100px] mt-[50px]">
          <div className="w-[100%] flex flex-row items-center mb-[10px]">
            <div className="w-[10px] h-[10px] bg-yellow-500 ml-[15px]"></div>
            <p className="ml-[5px]">All Nfts</p>
            <div className=" bg-[#008510] w-[10px] h-[10px]  ml-[15px]"></div>
            <p className="ml-[5px]">Next paid nfts</p>
            <div className="bg-blue-600 w-[10px] h-[10px] ml-[15px]"></div>
            <p className="ml-[5px]">Your Nft's</p>
          </div>
          {blockData.map((dataSet, index) => {
            const hasUserData = dataSet.some((item) => item.user);
            return hasUserData ? (
              <div key={index} className="mb-2 h-full">
                <h2 className="text-xl font-semibold mb-[5px]">
                  Queue {index + 1}
                </h2>
                <Slider
                  {...settings(dataSet.length)}
                  className="w-full sm:max-w-[90%] max-w-[95%] lg:ml-[30px] ml-[10px] h-full mt-[10px] lg:text-[16px] sm:text-[12px] text-[10px]"
                >
                  {dataSet.map((item, itemIndex) =>
                    item.user &&
                    item.user.toLowerCase() === address &&
                    item.nextPaied === false ? (
                      <div key={itemIndex} className="">
                        <div className="mt-[50px] nftUserPiscando p-2 lg:p-4 caixa3d transform transition-transform">
                          <div className="">
                            <p className="font-semibold">
                              {address &&
                              item.user.toLocaleLowerCase() ==
                                address.toLocaleLowerCase()
                                ? "Your"
                                : "N/A"}
                            </p>
                            <h3>Position in the queue: {itemIndex + 1}</h3>
                          </div>
                          <p>
                            User:{" "}
                            <span>
                              {" "}
                              {item.user
                                ? `${item.user.slice(0, 6)}...${item.user.slice(
                                    -4
                                  )}`
                                : "N/A"}
                            </span>
                          </p>
                          <p>Index: {Number(item.index)}</p>
                          <p>
                            Will Received:{" "}
                            {youWillRecieved(Number(item.batchLevel))}$
                          </p>
                        </div>
                      </div>
                    ) : item.user && item.nextPaied === true ? (
                      <div key={itemIndex} className="relative">
                        <div className="nftPaidPiscando mt-[50px] p-2 lg:p-4 transform transition-transform caixa3d h-full flex flex-col justify-between">
                          <div className="">
                            <p className="font-semibold">
                              {address &&
                              item.user.toLocaleLowerCase() ==
                                address.toLocaleLowerCase()
                                ? "Your"
                                : "N/A"}
                            </p>
                            <h3>Position in the queue: {itemIndex + 1}</h3>
                          </div>
                          <p>
                            User:{" "}
                            <span>
                              {" "}
                              {item.user
                                ? `${item.user.slice(0, 6)}...${item.user.slice(
                                    -4
                                  )}`
                                : "N/A"}
                            </span>
                            <p>Index: {Number(item.index)}</p>
                          </p>
                          <p className="font-semibold">
                            {address &&
                            item.user.toLocaleLowerCase() ==
                              address.toLocaleLowerCase()
                              ? `Will Received ${youWillRecieved(
                                  Number(item.batchLevel)
                                )}$`
                              : "N/A"}
                          </p>
                          {item.user.toLocaleLowerCase() === address ? (
                            <button
                              onClick={() =>
                                doClaimQueue(
                                  Number(item.index),
                                  Number(item.batchLevel)
                                )
                              }
                              className="absolute justify-center left-1/2 transform -translate-x-1/2 py-[2px] w-[80%] flex bottom-0 border-[1px] text-[8px] md:text-[12px] border-white rounded-lg mt-[10px] glossy_claim"
                            >
                              CLAIM
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    ) : item.user && item.nextPaied == false ? (
                      <div key={itemIndex} className="relative">
                        <div className="nftPiscando mt-[50px] p-2 lg:p-4 transform transition-transform caixa3d">
                          <div className="">
                            <h3>Position in the queue: {itemIndex + 1}</h3>
                          </div>
                          <p>
                            User:{" "}
                            <span>
                              {" "}
                              {item.user
                                ? `${item.user.slice(0, 6)}...${item.user.slice(
                                    -4
                                  )}`
                                : "N/A"}
                            </span>
                            <p>Index: {Number(item.index)}</p>
                          </p>
                        </div>
                      </div>
                    ) : (
                      ""
                    )
                  )}
                </Slider>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {addNftOpen ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-80"
            onClick={handleApproveQueueOpen}
          ></div>
          <div className="relative bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <button
              className="absolute top-4 right-4 text-red-600"
              onClick={handleApproveQueueOpen}
            >
              <p className="font-bold">X</p>
            </button>
            <p className="text-center text-white text-[30px] font-Agency">
              ADD NFT QUEUE
            </p>
            <input
              className="w-full m-w-[90%] p-2 bg-[#33322d] rounded-3xl mt-[20px] focus:outline-none focus:border-2 focus:border-[#eda921]"
              value={inputValue}
              onChange={handleInputChange}
              type="number"
              placeholder="Which Batch"
            ></input>
            <div className="w-full flex flex-col items-center mb-[15px] mt-[20px]">
              <button
                onClick={handleSubmit}
                className="w-[150px] font-semibold rounded-3xl bg-[#eda921] p-[8px]"
              >
                Go Queue
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {approveToMintOpen ? (
        <div
          onClick={handleApproveMintOpen}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="fixed inset-0 bg-black opacity-80"></div>
          <div className="relative items-center justify-center flex bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <div className="w-[100%] flex items-center justify-center flex-col">
              <TbLockAccess className="border-2 text-[80px] rounded-full p-[20px] border-white" />
              <p className="font-Agency text-[35px] mt-[10px]">Unlock USDT</p>
              <p className="text-center text-[18px] mt-[6px]">
                We need your permission to move{" "}
                {nftCurrentPrice ? `${nftCurrentPrice}$` : "Loading..."} USDT on
                your behalf
              </p>
              {address ? (
                <button
                  onClick={doApproveMint}
                  className=" font-semibold rounded-3xl bg-[#eda921] px-[30px] py-[12px] my-[20px]"
                >
                  Approve USDT
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}

      {approveQueue ? (
        <div
          onClick={handleApproveQueueOpen}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="fixed inset-0 bg-black opacity-80"></div>
          <div className="relative items-center justify-center flex bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <div className="w-[100%] flex items-center justify-center flex-col">
              <TbLockAccess className="border-2 text-[80px] rounded-full p-[20px] border-white" />
              <p className="font-Agency text-[35px] mt-[10px]">Unlock NFT's</p>
              <p className="text-center text-[18px] mt-[6px]">
                We need your permission to add your NFTs to the queue on your
                behalf!
              </p>
              <p className="text-center text-[14px] mt-[6px]">
                You only need to do this once
              </p>
              {address ? (
                <button
                  onClick={doApproveNft}
                  className=" font-semibold rounded-3xl bg-[#eda921] px-[30px] py-[12px] my-[20px]"
                >
                  Approve NFT's
                </button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default SimpleSlider;

/*<p>Prox: {item.next ? item.next.toString() : 'N/A'}</p>
              <p>Anterior: {item.prev ? item.prev.toString() : 'N/A'}</p>
              <p>Index: {item.index ? item.index.toString() : 'N/A'}</p>
              <p>Batch Level: {item.batchLevel ? item.batchLevel.toString() : 'N/A'}</p>
              <p>Dollars Claimed: {item.dollarsClaimed ? item.dollarsClaimed.toString() : 'N/A'}</p>*/
