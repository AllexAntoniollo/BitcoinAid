import React from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

interface AlertProps {
  msg: string;
  onClose: () => void;
}

export default function Alert({ msg, onClose }: AlertProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 max-w-[95%] m-auto">
           <div className="fixed inset-0 bg-black opacity-80" onClick={onClose} ></div>
           <div className="relative bg-[#201f1b] border-2 border-[#3a6e01] p-6 rounded-lg shadow-lg w-[100%] max-w-lg z-10">
            <button className="text-[#ed4021] absolute top-2 right-4">X</button>
            <div className="flex flex-col w-[100%] items-center justify-center ">
            <IoIosCheckmarkCircleOutline className="text-[100px] text-[#3a6e01]"/>
            <strong className="font-bold text-[26px] px-[20px]">Congratulation </strong>
            </div>
            <div className="max-w-[98%] flex items-center justify-center">
            <span className="block sm:inline text-[20px] mt-[14px] text-center">{msg}</span>
            </div>
           </div>
    </div>
  );
}
