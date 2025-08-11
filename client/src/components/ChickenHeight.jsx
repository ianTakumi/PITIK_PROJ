import React, { useState } from "react";

export default function ChickenHeight({ distance }) {
  const [visibleCount, setVisibleCount] = useState(5);

  // Sanitize and format distance
  const sanitizedDistance = Math.max(0, distance).toFixed(2);

  const getStatus = () => {
    const numericDistance = parseFloat(sanitizedDistance);
    if (numericDistance < 10)
      return {
        text: "STILL LITTLE",
        color: "text-red-500",
        bgGradient: "from-red-100 to-red-200",
        icon: "🐣",
        progress: (numericDistance / 10) * 100,
      };
    if (numericDistance < 20)
      return {
        text: "STILL SMALL",
        color: "text-orange-500",
        bgGradient: "from-orange-100 to-orange-200",
        icon: "🐤",
        progress: ((numericDistance - 10) / 10) * 100 + 25,
      };
    if (numericDistance < 30)
      return {
        text: "ALMOST THERE",
        color: "text-yellow-600",
        bgGradient: "from-yellow-100 to-yellow-200",
        icon: "🐓",
        progress: ((numericDistance - 20) / 10) * 100 + 50,
      };
    return {
      text: "READY FOR HARVEST",
      color: "text-green-600",
      bgGradient: "from-green-100 to-green-200",
      icon: "🏆",
      progress: Math.min(100, ((numericDistance - 30) / 10) * 100 + 75),
    };
  };

  const status = getStatus();
  const numericDistance = parseFloat(sanitizedDistance);

  return (
    <div className="relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📏 <span>Chicken Height</span>
        </h2>
        <div className="text-2xl">{status.icon}</div>
      </div>

      {/* Main Height Display */}
      <div
        className={`bg-gradient-to-br ${status.bgGradient} rounded-2xl p-6 mb-6 border-2 border-white shadow-lg`}
      >
        <div className="text-center">
          <div className="text-6xl font-black text-gray-800 mb-2">
            {sanitizedDistance}
            <span className="text-3xl font-semibold text-gray-600 ml-1">
              cm
            </span>
          </div>
          <div
            className={`text-lg font-bold ${status.color} px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm inline-block shadow-md`}
          >
            {status.text}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Growth Progress</span>
          <span>{Math.round(status.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div
            className={`h-3 rounded-full bg-gradient-to-r ${
              status.progress < 25
                ? "from-red-400 to-red-500"
                : status.progress < 50
                ? "from-orange-400 to-orange-500"
                : status.progress < 75
                ? "from-yellow-400 to-yellow-500"
                : "from-green-400 to-green-500"
            } transition-all duration-500 ease-out shadow-sm`}
            style={{ width: `${Math.min(100, status.progress)}%` }}
          ></div>
        </div>
      </div>

      {/* Growth Milestones */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className={`p-3 rounded-xl ${
            numericDistance >= 10
              ? "bg-green-100 border-green-300"
              : "bg-gray-100 border-gray-300"
          } border-2 text-center transition-all duration-300`}
        >
          <div className="text-xl mb-1">
            {numericDistance >= 10 ? "✅" : "⏳"}
          </div>
          <div className="text-xs font-semibold text-gray-700">Small Size</div>
          <div className="text-xs text-gray-500">10cm</div>
        </div>

        <div
          className={`p-3 rounded-xl ${
            numericDistance >= 20
              ? "bg-green-100 border-green-300"
              : "bg-gray-100 border-gray-300"
          } border-2 text-center transition-all duration-300`}
        >
          <div className="text-xl mb-1">
            {numericDistance >= 20 ? "✅" : "⏳"}
          </div>
          <div className="text-xs font-semibold text-gray-700">Medium Size</div>
          <div className="text-xs text-gray-500">20cm</div>
        </div>

        <div
          className={`p-3 rounded-xl ${
            numericDistance >= 30
              ? "bg-green-100 border-green-300"
              : "bg-gray-100 border-gray-300"
          } border-2 text-center transition-all duration-300`}
        >
          <div className="text-xl mb-1">
            {numericDistance >= 30 ? "✅" : "⏳"}
          </div>
          <div className="text-xs font-semibold text-gray-700">Ready</div>
          <div className="text-xs text-gray-500">30cm</div>
        </div>

        <div
          className={`p-3 rounded-xl ${
            numericDistance >= 40
              ? "bg-green-100 border-green-300"
              : "bg-gray-100 border-gray-300"
          } border-2 text-center transition-all duration-300`}
        >
          <div className="text-xl mb-1">
            {numericDistance >= 40 ? "🏆" : "⏳"}
          </div>
          <div className="text-xs font-semibold text-gray-700">Optimal</div>
          <div className="text-xs text-gray-500">40cm+</div>
        </div>
      </div>
    </div>
  );
}
