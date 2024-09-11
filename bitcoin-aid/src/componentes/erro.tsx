interface ErrorProps {
    msg: string;
    onClose: () => void;
  }
  
  export default function Error({ msg, onClose }: ErrorProps) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro:</strong>
        <span className="block sm:inline"> {msg}</span>
        <button onClick={onClose} className="text-red-600">X</button>
      </div>
    );
  }
  