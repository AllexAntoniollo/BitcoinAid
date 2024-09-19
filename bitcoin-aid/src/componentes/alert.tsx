import React from "react";
import { PiConfettiFill } from "react-icons/pi";

interface AlertProps {
  msg: string;
  onClose: () => void;
}

export default function Alert({ msg, onClose }: AlertProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 max-w-[95%] m-auto">
           <div className="fixed inset-0 bg-black opacity-80" onClick={onClose} ></div>
           <div className="relative bg-[#201f1b] border-2 border-[#21ed91] p-10 rounded-lg shadow-lg w-[100%] max-w-lg z-10">
            <button className="text-[#ed4021] absolute top-2 right-4">X</button>
            <div className="flex flex-row w-[100%] items-center justify-center">
            <PiConfettiFill className="text-[30px] text-[#d79920]"/>
            <strong className="font-bold text-[26px] px-[20px]">Congratulation </strong>
            <PiConfettiFill className="text-[30px] text-[#d79920]"/>
            </div>
            <div className="max-w-[98%] flex items-center justify-center">
            <span className="block sm:inline text-[20px] mt-[20px] text-center">{msg}</span>
            </div>
           </div>
    </div>
  );
}
