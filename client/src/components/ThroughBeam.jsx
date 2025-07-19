import React, { useState } from "react";

export default function ThroughBeam({ beamState, history }) {
  const [visibleCount, setVisibleCount] = useState(5);

  const getStatus = () => {
    if (beamState === "interrupted") return { text: "OBSTRUCTED", color: "text-red-500" };
    if (beamState === "partial") return { text: "PARTIALLY BLOCKED", color: "text-orange-400" };
    return { text: "CLEAR", color: "text-green-400" };
  };

  const status = getStatus();
  const visibleHistory = Array.isArray(history) ? history.slice(0, visibleCount) : [];

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Through-Beam Sensor</h2>
      <p className={`text-5xl font-bold ${status.color}`}>{status.text}</p>

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Beam History</h3>
        <ul className="space-y-1 text-sm text-gray-300 max-h-48 overflow-auto">
          {visibleHistory.map((item, idx) => (
            <li key={idx}>
              <span className="font-semibold">{item.time}:</span> {item.state}
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
