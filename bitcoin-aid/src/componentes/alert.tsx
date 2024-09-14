interface AlertProps {
    msg: string;
    onClose: () => void;
  }
  
  export default function Alert({ msg, onClose }: AlertProps) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Alert:</strong>
        <span className="block sm:inline"> {msg}</span>
        <button onClick={onClose} className="text-green-600">X</button>
      </div>
    );
  }
  