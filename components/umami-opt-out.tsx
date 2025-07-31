"use client";

import { useState } from "react";

export function UmamiOptOut() {
  const [isOptedOut, setIsOptedOut] = useState(false);

  const handleOptOut = () => {
    localStorage.setItem("umami.disabled", "1");
    setIsOptedOut(true);
    window.location.reload();
  };

  if (isOptedOut) {
    return (
      <span className="text-green-600 font-medium">Analytics disabled</span>
    );
  }

  return (
    <button
      onClick={handleOptOut}
      className="text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400 underline cursor-pointer bg-transparent border-none p-0 font-inherit transition-colors duration-200"
    >
      clicking here to opt-out
    </button>
  );
}
