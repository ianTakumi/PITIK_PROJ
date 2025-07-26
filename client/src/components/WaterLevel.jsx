import React, { useState } from "react";

export default function WaterLevel({ waterLevel, history = [] }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const { percent = 0, status = "Unknown", raw = "-" } = waterLevel || {};

  const getColor = () => {
    switch (status.toLowerCase()) {
      case "low":
        return "text-red-500";
      case "medium":
        return "text-yellow-400";
      case "high":
        return "text-green-400";
      default:
        return "text-gray-300";
    }
  };

  const visibleHistory = history.slice(0, visibleCount);

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Water Level</h2>
      <p className="text-5xl font-bold text-white">{percent}%</p>
      <p className="text-sm text-gray-400">Raw: {raw}</p>
      <p className={`mt-2 text-xl font-semibold ${getColor()}`}>{status}</p>

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Past Readings</h3>
        <ul className="space-y-1 text-sm text-gray-300 max-h-48 overflow-auto">
          {visibleHistory.map((item, idx) => (
            <li key={idx}>
              <span className="font-semibold">{item.time}:</span> {item.percent}
              % – {item.status}
            </li>
          ))}
        </ul>

        {Array.isArray(history) && visibleCount < history.length && (
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
