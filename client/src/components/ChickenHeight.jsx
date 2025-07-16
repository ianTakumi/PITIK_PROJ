import React, { useState } from "react";

export default function ChickenHeight({ distance, history }) {
  const [visibleCount, setVisibleCount] = useState(5);

  const getStatus = () => {
    if (distance < 10) return { text: "VERY CLOSE", color: "text-red-500" };
    if (distance < 50) return { text: "CLOSE", color: "text-orange-400" };
    if (distance < 100) return { text: "MODERATE", color: "text-yellow-300" };
    return { text: "FAR", color: "text-green-400" };
  };

  const status = getStatus();
  const visibleHistory = history.slice(0, visibleCount);

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Chicken Height</h2>
      <p className="text-5xl font-bold text-white">{distance} cm</p>
      <p className={`mt-2 text-xl font-semibold ${status.color}`}>
        {status.text}
      </p>

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Past Readings</h3>
        <ul className="space-y-1 text-sm text-gray-300 max-h-48 overflow-auto">
          {visibleHistory.map((item, idx) => (
            <li key={idx}>
              <span className="font-semibold">{item.time}:</span> {item.value}{" "}
              cm
            </li>
          ))}
        </ul>

        {visibleCount < history.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="mt-2 text-blue-400 hover:underline text-sm"
          >
            View More
          </button>
        )}
      </div>
    </div>
  );
}
