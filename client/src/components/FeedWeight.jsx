//load cell platform, eto yung 50kg dba? 

import React, { useState } from "react";

export default function FeedWeightMonitor({ weight, history }) {
  const [visibleCount, setVisibleCount] = useState(5);

  // Define thresholds (adjust based on your actual platform's calibration)
  const getStatus = () => {
    if (weight < 200) return { text: "EMPTY — REFILL NEEDED!", color: "text-red-500" };
    if (weight < 1000) return { text: "LOW FEED", color: "text-yellow-400" };
    return { text: "ENOUGH FEED", color: "text-green-400" };
  };

  const status = getStatus();
  const visibleHistory = Array.isArray(history) ? history.slice(0, visibleCount) : [];

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Feed Tray Load Cell</h2>
      <div className="flex items-baseline justify-between">
        <p className="text-5xl font-bold text-white">{weight.toFixed(1)} g</p>
        <span className={`text-xl font-semibold ${status.color}`}>{status.text}</span>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">History</h3>
        <ul className="space-y-1 text-sm text-gray-300 max-h-48 overflow-y-auto">
          {visibleHistory.map((item, idx) => (
            <li key={idx}>
              <span className="font-mono text-sky-300">{item.time || item.timestamp || "N/A"}:</span>{" "}
              {item.value} g
            </li>
          ))}
        </ul>

        {Array.isArray(history) && visibleCount < history.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 5)}
            className="mt-2 text-blue-400 hover:underline text-sm"
          >
            Show More
          </button>
        )}
      </div>
    </div>
  );
}
