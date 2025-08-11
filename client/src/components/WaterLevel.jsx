import React, { useState } from "react";

export default function WaterLevel({ waterLevel, history = [] }) {
  const [visibleCount, setVisibleCount] = useState(5);
  const { percent = 0, status = "Unknown", raw = "-" } = waterLevel || {};

  const getStatusInfo = () => {
    switch (status.toLowerCase()) {
      case "low":
        return {
          color: "text-red-600",
          bgGradient: "from-red-100 to-red-200",
          borderColor: "border-red-300",
          icon: "🚨",
          waveColor: "from-red-300 to-red-400",
          message: "Refill Soon!",
        };
      case "medium":
        return {
          color: "text-yellow-600",
          bgGradient: "from-yellow-100 to-yellow-200",
          borderColor: "border-yellow-300",
          icon: "⚠️",
          waveColor: "from-yellow-300 to-yellow-400",
          message: "Monitor Level",
        };
      case "high":
        return {
          color: "text-green-600",
          bgGradient: "from-green-100 to-green-200",
          borderColor: "border-green-300",
          icon: "✅",
          waveColor: "from-green-300 to-green-400",
          message: "Optimal Level",
        };
      default:
        return {
          color: "text-gray-600",
          bgGradient: "from-gray-100 to-gray-200",
          borderColor: "border-gray-300",
          icon: "❓",
          waveColor: "from-gray-300 to-gray-400",
          message: "Checking...",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const visibleHistory = history.slice(0, visibleCount);

  return (
    <div className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          💧 <span>Water Level</span>
        </h2>
        <div className="text-2xl">{statusInfo.icon}</div>
      </div>

      {/* Main Water Display */}
      <div
        className={`bg-gradient-to-br ${statusInfo.bgGradient} rounded-2xl p-6 mb-6 border-2 ${statusInfo.borderColor} shadow-lg relative overflow-hidden`}
      >
        {/* Animated water waves background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className={`absolute bottom-0 left-0 w-full bg-gradient-to-r ${statusInfo.waveColor} transition-all duration-1000`}
            style={{ height: `${percent}%` }}
          >
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-200 to-blue-300 opacity-50 animate-pulse"></div>
          </div>
        </div>

        <div className="text-center relative z-10">
          <div className="text-6xl font-black text-gray-800 mb-2">
            {percent}
            <span className="text-3xl font-semibold text-gray-600 ml-1">%</span>
          </div>
          <div
            className={`text-lg font-bold ${statusInfo.color} px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm inline-block shadow-md mb-2`}
          >
            {status.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {statusInfo.message}
          </div>
        </div>
      </div>

      {/* Water Level Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Water Tank</span>
          <span>Raw: {raw}</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
          {/* Animated water fill */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${statusInfo.waveColor} transition-all duration-1000 ease-out shadow-sm relative overflow-hidden`}
            style={{ width: `${Math.min(100, percent)}%` }}
          >
            {/* Wave animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
          </div>

          {/* Level markers */}
          <div className="absolute inset-0 flex justify-between items-center px-2">
            <div className="w-0.5 h-2 bg-gray-400 opacity-50"></div>
            <div className="w-0.5 h-2 bg-gray-400 opacity-50"></div>
            <div className="w-0.5 h-2 bg-gray-400 opacity-50"></div>
            <div className="w-0.5 h-2 bg-gray-400 opacity-50"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Empty</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>Full</span>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div
          className={`p-3 rounded-xl text-center transition-all duration-300 ${
            percent <= 20
              ? "bg-red-100 border-red-300 border-2"
              : "bg-gray-100 border-gray-300 border"
          }`}
        >
          <div className="text-lg mb-1">{percent <= 20 ? "🚨" : "⚪"}</div>
          <div className="text-xs font-semibold text-gray-700">Low Alert</div>
          <div className="text-xs text-gray-500">≤20%</div>
        </div>

        <div
          className={`p-3 rounded-xl text-center transition-all duration-300 ${
            percent > 20 && percent <= 70
              ? "bg-yellow-100 border-yellow-300 border-2"
              : "bg-gray-100 border-gray-300 border"
          }`}
        >
          <div className="text-lg mb-1">
            {percent > 20 && percent <= 70 ? "⚠️" : "⚪"}
          </div>
          <div className="text-xs font-semibold text-gray-700">Medium</div>
          <div className="text-xs text-gray-500">21-70%</div>
        </div>

        <div
          className={`p-3 rounded-xl text-center transition-all duration-300 ${
            percent > 70
              ? "bg-green-100 border-green-300 border-2"
              : "bg-gray-100 border-gray-300 border"
          }`}
        >
          <div className="text-lg mb-1">{percent > 70 ? "✅" : "⚪"}</div>
          <div className="text-xs font-semibold text-gray-700">Optimal</div>
          <div className="text-xs text-gray-500">>70%</div>
        </div>
      </div>

      {/* History Section */}
      {Array.isArray(history) && history.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 text-sm">
              📊 Recent Readings
            </h3>
            <button
              onClick={() =>
                setVisibleCount((prev) =>
                  prev === 5 ? Math.min(history.length, 15) : 5
                )
              }
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors"
            >
              {visibleCount === 5 ? "Show More" : "Show Less"}
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {visibleHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 px-3 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.percent <= 20
                        ? "bg-red-400"
                        : item.percent <= 70
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                  ></span>
                  <span className="text-sm text-gray-600">
                    {item.time || new Date().toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-800">
                    {item.percent}%
                  </span>
                  <span
                    className={`text-xs ml-2 px-2 py-1 rounded-full ${
                      item.status?.toLowerCase() === "low"
                        ? "bg-red-100 text-red-600"
                        : item.status?.toLowerCase() === "medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : item.status?.toLowerCase() === "high"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status || "Unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < history.length && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 5)}
              className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 py-2 rounded-lg transition-colors"
            >
              Load More Readings ({history.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
