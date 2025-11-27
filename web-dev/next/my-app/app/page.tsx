"use client";
import Image from "next/image";

export default function Home() {
  const handleClick = () => {
    const data = {
      name: "Akshat Shukla",
      email: "akshat@gmail.com",
    };

    const send = async () => {
      try {
        const response = await fetch("/api/add", {   
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const res = await response.json();
        console.log("Response from server:", res);
      } catch (error) {
        console.error("Error sending data:", error);
      }
    };

    send();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <main className="flex w-full flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold">Welcome to My Next.js App!</h1>
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleClick}
        >
          Click Me!
        </button>
      </main>
    </div>
  );
}
