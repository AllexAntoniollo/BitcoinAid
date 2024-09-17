"use client";
import { useEffect } from "react";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  getQueue,
  getCurrentBatch,
  addQueue,
  mintNft,
} from "@/services/Web3Services";
import { nftQueue } from "@/services/types";
import Image from "next/image";

const SimpleSlider = () => {
  const [queueData, setQueueData] = useState<nftQueue[][]>([]);
  const [currentBatch, setCurrentBatch] = useState<Number>(0);
  const [addNftOpen, setNftAddOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number | "">("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Converte o valor para um número, se possível
    const value = event.target.value;
    const numericValue = value === "" ? "" : Number(value);
    setInputValue(numericValue);
  };

  const handleSubmit = () => {
    addQueue(Number(inputValue));
  };

  const buyNft = () => {
    mintNft(1);
  };

  const openAddNft = () => {
    setNftAddOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const result = await getCurrentBatch();
        setCurrentBatch(result);
        console.log("lote: %d", result);

        const lote = currentBatch;
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
    fetchQueue();
  }, []);

  const settings = (dataSetLength: number) => ({
    dots: true,
    infinite: false, // Desativa o efeito "infinite" se houver menos de 3 itens
    speed: 500,
    slidesToShow: 3, // Mostra no máximo 4 slides
    slidesToScroll: Math.min(3, dataSetLength), // Rola no máximo 4 slides
    adaptiveHeight: true, // Ajusta a altura do slider com base no conteúdo
    arrows: dataSetLength > 3, // Mostra as setas de navegação apenas se houver mais de 3 itens
    swipe: dataSetLength > 3, // Permite o swipe apenas se houver mais de 3 itens
    touchMove: dataSetLength > 3, // Permite o movimento com toque apenas se houver mais de 3 itens
    draggable: dataSetLength > 3,

    responsive: [
      {
        breakpoint: 1300, // Largura da tela para o breakpoint
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: false,
          dots: true,
          arrows: dataSetLength > 2, // Mostra as setas de navegação apenas se houver mais de 3 itens
          swipe: dataSetLength > 2, // Permite o swipe apenas se houver mais de 3 itens
          touchMove: dataSetLength > 2, // Permite o movimento com toque apenas se houver mais de 3 itens
          draggable: dataSetLength > 2,
        },
      },
      {
        breakpoint: 950,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: false,
          dots: true,
          arrows: dataSetLength > 2, // Mostra as setas de navegação apenas se houver mais de 3 itens
          swipe: dataSetLength > 2, // Permite o swipe apenas se houver mais de 3 itens
          touchMove: dataSetLength > 2, // Permite o movimento com toque apenas se houver mais de 3 itens
          draggable: dataSetLength > 2,
        },
      },
      {
        breakpoint: 890, // Largura da tela para o breakpoint
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
          arrows: dataSetLength > 1, // Mostra as setas de navegação apenas se houver mais de 3 itens
          swipe: dataSetLength > 1, // Permite o swipe apenas se houver mais de 3 itens
          touchMove: dataSetLength > 1, // Permite o movimento com toque apenas se houver mais de 3 itens
          draggable: dataSetLength > 1,
        },
      },
    ],
  });
  return (
    <>
      <div className=" w-full sm:max-w-[90%] max-w-[98%]  m-auto p-4">
        <p className="mt-[40px] mb-[40px] leading-tight font-Agency text-[50px] sm:text-[80px] font-normal w-full">
          Bitcoin AiD Protocol - NFT Payment Queue
        </p>
        <div className="mx-auto lg:w-[35%] w-[90%] bg-[#26251f35] rounded-3xl mb-[10px] flex flex-col p-[10px] ">
          <p className="font-Agency mx-auto text-[40px]">Buy NFT - Lote #4</p>
          <Image
            src="/images/NFTSATOSHI.png"
            alt="NFT"
            width={1000}
            height={1000}
            className="mx-auto max-w-[60%] max-h-[55%]"
          ></Image>
          <p className="font-Agency mx-auto text-[25px] mt-[10px]">$10</p>
          <button
            onClick={buyNft}
            className="mx-auto p-[10px] w-[200px] bg-[#d79920] rounded-full mt-[10px]"
          >
            Buy Nft
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:gap-6 mb-[30px]">
          <div className="mx-auto mr-[30px] md:w-[40%] w-full bg-[#26251f35] h-[200px] mt-[20px] flex flex-col justify-between items-center p-4">
            <p className="font-Agency text-center text-[25px] mt-[20px]">
              Add your NFT's to Queue
            </p>
            <div className="w-full flex justify-center">
              <button
                onClick={openAddNft}
                className="bg-[#d79920] w-[200px] p-[10px] rounded-full mb-[20px]"
              >
                <p className="font-Agency text-[24px]">Add NFT +</p>
              </button>
            </div>
          </div>

          <div className="mx-auto md:w-[40%] w-full bg-[#26251f35] h-[200px] mt-[20px] flex flex-col justify-between items-center p-4">
            <p className="font-Agency text-center text-[25px] mt-[20px]">
              Claim NFT's Rewards
            </p>
            <div className="w-full flex justify-center">
              <button className="bg-[#3a6e01] w-[200px] p-[10px] rounded-full mb-[20px]">
                <p className="font-Agency text-[24px]">Claim</p>
              </button>
            </div>
          </div>
        </div>

        <div className="h-[300px] mx-auto max-w-[100%] overflow-y-auto custom-scroll slider-container p-2 ml-[30px] mb-[100px] mt-[100px]">
          {queueData.map((dataSet, index) => {
            const hasUserData = dataSet.some((item) => item.user);

            return hasUserData ? (

            
            <div key={index} className="mb-4 h-full">
              <h2 className="text-xl font-semibold mb-[5px]">
                Fila {index + 1}
              </h2>
              <Slider 
                {...settings(dataSet.length)}
                className="w-full max-w-[90%] mx-auto h-full"
              >
                {dataSet.map((item, itemIndex) => (
                  item.user ? (
                  <div key={itemIndex} className="mr-[10px]">
                    <div className="mt-[50px] ml-[50px] bg-[#d79920] p-4 transform transition-transform duration-300 w-[150px] h-[200px] sm:w-[260px] hover:scale-105 hover:rotate-1 hover:shadow-lg hover:bg-[#d79a20f2] sm:caixa3d nftPiscando">
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
                      <p>Prox: {item.next ? item.next.toString() : "N/A"}</p>
                      <p>
                        Anterior: {item.prev ? item.prev.toString() : "N/A"}
                      </p>
                      <p>Index: {item.index ? item.index.toString() : "N/A"}</p>
                      <p>
                        Batch Level:{" "}
                        {item.batchLevel ? item.batchLevel.toString() : "N/A"}
                      </p>
                      <p>
                        Dollars Claimed:{" "}
                        {item.dollarsClaimed
                          ? item.dollarsClaimed.toString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  ) : (
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
    </>
  );
};

export default SimpleSlider;

/*<p>Prox: {item.next ? item.next.toString() : 'N/A'}</p>
              <p>Anterior: {item.prev ? item.prev.toString() : 'N/A'}</p>
              <p>Index: {item.index ? item.index.toString() : 'N/A'}</p>
              <p>Batch Level: {item.batchLevel ? item.batchLevel.toString() : 'N/A'}</p>
              <p>Dollars Claimed: {item.dollarsClaimed ? item.dollarsClaimed.toString() : 'N/A'}</p>*/
