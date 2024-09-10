"use client";
import { useState } from "react";
import { doLogin } from "@/services/Web3Services";
import Link from "next/link";

export default function Stake() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await doLogin();

      setMessage("Login successful!");
      setError("");
    } catch (err) {
      setError("Failed to login. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Stake Page</h1>
      {message && <div className="text-green-500 mb-2">{message}</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-black text-white font-bold py-2 px-4 rounded"
      >
        Login
      </button>

      <Link href="/">
        <p className="text-blue-500 mt-4">Go to Home</p>
      </Link>
    </div>
  );
}
