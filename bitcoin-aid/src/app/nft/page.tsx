"use client";
import {ethers} from "ethers"
import { TbLockAccess } from "react-icons/tb";
import { useEffect } from "react";
import { useState } from "react";
import { useWallet } from "@/services/walletContext";
import { SiPolygon } from "react-icons/si";
import Slider from "react-slick";
import Error from "@/componentes/erro";
import Alert from "@/componentes/alert";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaLongArrowAltDown } from "react-icons/fa";
import {
  getQueue,
  getCurrentBatch,
  addQueue,
  mintNft,
  nftPrice,
  approveMint,
} from "@/services/Web3Services";
import { nftQueue } from "@/services/types";
import Image from "next/image";

const SimpleSlider = () => {
  const [loading, setLoading] = useState(false);
  const [queueData, setQueueData] = useState<nftQueue[][]>([]);
  const [queuePay, setQueuePay] = useState<nftQueue[]>();
  const [currentBatch, setCurrentBatch] = useState<number>(0);
  const [addNftOpen, setNftAddOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number | "">("");
  const [nftCurrentPrice, setNftCurrentPrice] = useState<number>(0);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const {address, setAddress} = useWallet();
  const [approveToMint, setApproveToMint] = useState<boolean>(false);
  const [approveToMintOpen, setApproveToMintOpen] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Converte o valor para um número, se possível
    const value = event.target.value;
    const numericValue = value === "" ? "" : Number(value);
    setInputValue(numericValue);
  };


  async function approveToMintNft(value:number){
    try{
      setLoading(true);
      const priceInWei = BigInt(value) * BigInt(Math.pow(10,18));
      const result = await approveMint(priceInWei);
      if(result){
        setLoading(false);
        setAlert("Your NFT is now available in your wallet");
        setApproveToMint(false);
      }
    }catch(err){
      setLoading(false);
      setError("Failed to buy nft")
    }
  }

  const doApproveMint = () => {
    const priceInWei:number = Number(nftCurrentPrice) * Number(Math.pow(10, 18));
    console.log(priceInWei);
    if(address){
      approveToMintNft(priceInWei);
    }else{
      setError("You need connect your wallet");
    }
  }

  const handleSubmit = () => {
    addQueue(Number(inputValue));
  };

  const goApproveMint = () => {
    setApproveToMintOpen(true);
  }
const handleApproveMintOpen = () => {
  setApproveToMintOpen(prevState => !prevState);
}
  const buyNft = async () => {
    try{
      setLoading(true);
      const result = await mintNft(1);
      if(result){
        setLoading(false);
        setAlert("Congratulations on purchasing your NFT")
      }else{
        setError("Failed to purchase nft")
        setLoading(false);
      }
    }catch(err){
      setLoading(false);
      setError("Failed to purchase nft");
    }
  };

  const openAddNft = () => {
    setNftAddOpen((prevState) => !prevState);
  };

  async function getNftPrice(currentBatch:number){
    try{
      const result = await nftPrice(currentBatch);
      setNftCurrentPrice(result);
    }catch(err){
      setError("Failed on get NFT's price")
    }
  }

  const clearError = () => {
    setError("");
  }
  const clearAlert = () => {
    setAlert("");
  }

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
    fetchQueue();
  }, []);

  useEffect(() => {
    if(currentBatch){
      getNftPrice(currentBatch);
    }
  },[currentBatch])

  const settings = (dataSetLength: number) => {
    const maxSlidesToShow = 4;
    return{
      dots: true,
      infinite: dataSetLength > maxSlidesToShow, // Desativa o efeito "infinite" se houver menos de 3 itens
      speed: 500,
      slidesToShow: 4, // Mostra no máximo 4 slides
      slidesToScroll: 1, // Rola no máximo 4 slides
      adaptiveHeight: true, // Ajusta a altura do slider com base no conteúdo
      arrows: dataSetLength > 4, // Mostra as setas de navegação apenas se houver mais de 3 itens
      swipe: true, // Permite o swipe apenas se houver mais de 3 itens
      touchMove: true, // Permite o movimento com toque apenas se houver mais de 3 itens
      draggable: dataSetLength > 4,
  
      responsive: [
        {
          breakpoint: 1300, // Largura da tela para o breakpoint
          settings: {
            slidesToShow: 2.7,
            slidesToScroll: 1,
            infinite: dataSetLength > maxSlidesToShow-2,
            dots: true,
            arrows: dataSetLength > 2, // Mostra as setas de navegação apenas se houver mais de 3 itens
            swipe: true, // Permite o swipe apenas se houver mais de 3 itens
            touchMove: true, // Permite o movimento com toque apenas se houver mais de 3 itens
            draggable: dataSetLength > 2,
          },
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: dataSetLength > maxSlidesToShow-1,
            dots: true,
            arrows: dataSetLength > 3, // Mostra as setas de navegação apenas se houver mais de 3 itens
            swipe: true, // Permite o swipe apenas se houver mais de 3 itens
            touchMove: true, // Permite o movimento com toque apenas se houver mais de 3 itens
            draggable: dataSetLength > 3,
          },
        },
        {
        breakpoint: 950,
        settings: {
          dots: false,
          slidesToShow: 2.2,
          slidesToScroll: 1,
          infinite: dataSetLength > maxSlidesToShow-2,
          arrows: false, // Mostra as setas de navegação apenas se houver mais de 3 itens
          swipe: true, // Permite o swipe apenas se houver mais de 3 itens
          touchMove: true, // Permite o movimento com toque apenas se houver mais de 3 itens
          draggable: dataSetLength > 2,
        },
      },
      ],
    };
  };
    
   
  return (
    <>
    
    {error && <Error msg={error} onClose={clearError} />}
    {alert && <Alert msg={alert} onClose={clearAlert}/>}
    {loading && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-10 h-10 border-t-4 border-b-4 border-[#d79920] rounded-full animate-spin"></div>
    </div>
  )}

      <div className=" w-full sm:max-w-[90%] max-w-[98%] m-auto p-4">
        <p className="mt-[40px] mb-[40px] leading-tight font-Agency text-[50px] sm:text-[80px] font-normal w-full">
          Bitcoin AiD Protocol - NFT Payment Queue
        </p>
        <div className=" mx-auto lg:w-[35%] w-[90%] bg-[#26251f35] rounded-3xl mb-[10px] flex flex-col py-[30px] shadow-lg glossy">
          <div className="glossy-content flex items-center justify-center flex-col">
          <p className=" mx-auto text-[30px] mb-[8px]">{currentBatch ? `Buy NFT - Lote #${currentBatch}` : 'Loading...'}</p>
          <Image
            src="/images/NFTSATOSHI.png"
            alt="NFT"
            width={1000}
            height={1000}
            className="mx-auto max-w-[60%] max-h-[55%]"
          ></Image>
          <p className="mx-auto text-[20px] mt-[10px] font-semibold">{nftCurrentPrice ? `${nftCurrentPrice}$` : "Loading..."}</p>
          {approveToMint ?(
              <button
              onClick={goApproveMint}
              className=" hover:bg-[#a47618] mx-auto p-[10px] w-[200px] bg-[#d79920] rounded-full mt-[10px] glossy_cta"
              >
                Buy Nft
              </button>
          ):(
            <button
            onClick={buyNft}
            className=" hover:bg-[#a47618] mx-auto p-[10px] w-[200px] bg-[#d79920] rounded-full mt-[10px] glossy_cta"
            >
            Buy Nft
            </button>
          )}

          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:gap-6 mb-[30px] mt-[25px]">
          <div className="mx-auto mr-[30px] lg:w-[40%] w-full bg-[#26251f35] h-[200px] mt-[20px] flex flex-col justify-between items-center p-4  border-2 border-[#d79920]">
            <p className=" text-center text-[24px] mt-[20px]">
              Add your NFT's to Queue
            </p>
            <div className="w-full flex justify-center">
              <button
                onClick={openAddNft}
                className="bg-[#d79920] w-[200px] p-[10px] rounded-full mb-[20px] glossy_cta hover:bg-[#a47618]"
              >
                <p className="text-[20px] font-semibold">Add NFT +</p>
              </button>
            </div>
          </div>

          <div className="mx-auto lg:w-[40%] w-full bg-[#26251f35] h-[200px] mt-[20px] flex flex-col justify-between items-center p-4 border-2 border-[#3a6e01]">
            <p className="text-center text-[24px] mt-[20px]">
              Claim NFT's Rewards
            </p>
            <div className="w-full flex justify-center">
              <button className="bg-[#3a6e01] w-[200px] p-[10px] rounded-full mb-[20px] glossy_claim hover:bg-[#274c00]">
                <p className="font-semibold text-[20px]">Claim</p>
              </button>
            </div>
          </div>
        </div>

        <div className="h-[300px] mx-auto max-w-[100%] overflow-y-auto slider-container p-2 mb-[100px] mt-[50px]">
        <div className="w-[100%] flex flex-row items-center mb-[10px]">
          <div className="w-[10px] h-[10px] bg-yellow-500 ml-[15px]">
          </div>
          <p className="ml-[5px]">All Nfts</p>
          <div className=" bg-[#008510] w-[10px] h-[10px]  ml-[15px]">
          </div>
          <p className="ml-[5px]">Next paid nfts</p>
          <div className="bg-blue-600 w-[10px] h-[10px] ml-[15px]">
          </div>
          <p className="ml-[5px]">Your Nft's</p>
        </div>
          {queueData.map((dataSet, index) => {
            const hasUserData = dataSet.some((item) => item.user);
            return hasUserData ? (

              
            <div key={index} className="mb-2 h-full">
              
              <h2 className="text-xl font-semibold mb-[5px]">
                Fila {index + 1}
              </h2>
              <Slider 
                {...settings(dataSet.length)}
                className="w-full sm:max-w-[90%] max-w-[90%] lg:ml-[30px] ml-[10px] h-full mt-[10px] md:text-[16px] text-[12px]">
                {dataSet.map((item, itemIndex) => (
                  item.user && item.user.toLowerCase() === address ?(
                  <div key={itemIndex} className="">
                    {itemIndex+1 === 1 ?(
                      <>
                      <div className="absolute w-[30px] h-[30px] top-[0px] left-[0px] z-999">
                      <FaLongArrowAltDown className="text-[20px]"/>
                      </div>
                      </>
                    ):(
                      ""
                    )}
                    <div className="mt-[50px] nftUserPiscando p-2 lg:p-4 caixa3d transform transition-transform">
                      <div className="">
                        <h3>Posição da Fila: {itemIndex + 1}</h3>
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

                      <p>Index: {item.index ? item.index.toString() : "N/A"}</p>
                      <p>
                        Batch Level:{" "}
                        {item.batchLevel ? item.batchLevel.toString() : "N/A"}
                      </p>
                      <p>
                      Will Received: {Number(nftCurrentPrice)*3}$
                      </p>
                    </div>
                  </div>
                  ) : item.user ? (
                    <div key={itemIndex} className="relative">
                       {itemIndex+1 === 1 ?(
                      <>
                      <div className="absolute w-[30px] h-[30px] top-[10px] left-[-15px] z-999 animate-bounce">
                      <FaLongArrowAltDown className="text-[30px]"/>
                      </div>
                      </>
                    ):(
                      ""
                    )}
                    <div className="nftPiscando mt-[50px] p-2 lg:p-4 transform transition-transform caixa3d">
                      <div className="">
                        <h3>Posição da Fila: {itemIndex + 1}</h3>
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
                      <p>Index: {item.index ? item.index.toString() : "N/A"}</p>
                      <p>
                        Batch Level:{" "}
                        {item.batchLevel ? item.batchLevel.toString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  ):(
                    ""
                  )
                ))}
              </Slider>
            </div> 
            ) : null
        })}
        </div>
      </div>


      {addNftOpen ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-80"
            onClick={openAddNft}
          ></div>
          <div className="relative bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
            <button
              className="absolute top-4 right-4 text-red-600"
              onClick={openAddNft}
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

      {approveToMintOpen ?(
       <div onClick={handleApproveMintOpen} className="fixed inset-0 flex items-center justify-center z-50">
       <div className="fixed inset-0 bg-black opacity-80" ></div>
         <div className="relative items-center justify-center flex bg-[#201f1b] border-2 border-[#eda921] p-6 rounded-lg shadow-lg w-[80%] max-w-lg z-10">
             <div className="w-[100%] flex items-center justify-center flex-col">                
               <TbLockAccess className="border-2 text-[80px] rounded-full p-[20px] border-white"/> 
               <p className="font-Agency text-[35px] mt-[10px]">Unlock USDT</p>
               <p className="text-center text-[18px] mt-[6px]">We need your permission to move {nftCurrentPrice ? `${nftCurrentPrice}$` : "Loading..."} USDT on your behalf</p>
               {address?(
                 <button onClick={doApproveMint} className=" font-semibold rounded-3xl bg-[#eda921] px-[30px] py-[12px] my-[20px]">Approve USDT</button>
               ):(
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
