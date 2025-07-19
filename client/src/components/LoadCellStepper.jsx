import React, { useState } from "react";

export default function LoadCellStepper({ weight, height, history }) {
  const [visibleCount, setVisibleCount] = useState(5);

  const getSortStatus = () => {
    if (weight >= 2000 && height >= 45) {
      return { text: "MARKET READY", color: "text-green-400" };
    } else if (weight >= 1500 && height >= 35) {
      return { text: "NEAR READY", color: "text-yellow-300" };
    } else {
      return { text: "GROWING", color: "text-orange-400" };
    }
  };

  const status = getSortStatus();
  const visibleHistory = Array.isArray(history) ? history.slice(0, visibleCount) : [];

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Load Cell Stepper</h2>
      <div className="text-xl mb-2">
        <p>Weight: <span className="font-bold text-white">{weight} g</span></p>
        <p>Height: <span className="font-bold text-white">{height} cm</span></p>
      </div>

      <p className={`mt-2 text-2xl font-bold ${status.color}`}>
        {status.text}
      </p>

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Past Readings</h3>
        <ul className="space-y-1 text-sm text-gray-300 max-h-48 overflow-auto">
          {visibleHistory.map((item, idx) => (
            <li key={idx}>
              <span className="font-semibold">{item.time}:</span>{" "}
              {item.weight}g, {item.height}cm
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
