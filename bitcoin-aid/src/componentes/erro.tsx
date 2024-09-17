interface ErrorProps {
    msg: string;
    onClose: () => void;
  }
  
  export default function Error({ msg, onClose }: ErrorProps) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
           <div className="fixed inset-0 bg-black opacity-80" onClick={onClose} ></div>
           <div className="relative bg-[#201f1b] border-2 border-[#ed4021] p-10 rounded-lg shadow-lg w-[100%] max-w-lg z-10">
            <button className="text-[#ed4021] absolute top-2 right-4">X</button>
            <strong className="font-bold text-[26px]">Erro: </strong>
            <span className="block sm:inline text-[24px]">{msg}</span>
           </div>
      </div>

    );
  }
  