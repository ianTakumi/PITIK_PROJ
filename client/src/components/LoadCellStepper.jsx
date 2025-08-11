import React from "react";
import { Scale, TrendingUp } from "lucide-react";

export default function LoadCellStepper({ weight = 55 }) {
  const getSortStatus = () => {
    if (weight >= 2000) {
      return {
        text: "MARKET READY",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: TrendingUp,
      };
    } else if (weight >= 1500) {
      return {
        text: "NEAR READY",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: TrendingUp,
      };
    } else {
      return {
        text: "GROWING",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        icon: TrendingUp,
      };
    }
  };

  const getWeightStatus = () => {
    if (weight < 20) return "Light weight";
    if (weight < 50) return "Moderate weight";
    if (weight < 100) return "Good weight";
    return "Heavy weight";
  };

  const status = getSortStatus();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Scale className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Load Cell Monitor
            </h2>
            <p className="text-sm text-gray-600">Real-time weight tracking</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Current Weight Display */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
          <div className="text-center">
            <div className="text-5xl font-black text-gray-800 mb-2">
              {weight}
              <span className="text-2xl font-semibold text-gray-600 ml-1">
                g
              </span>
            </div>
            <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold inline-block border border-orange-200">
              {getWeightStatus()}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`${status.bgColor} ${status.borderColor} border rounded-xl p-4 mb-6`}
        >
          <div className="flex items-center justify-center gap-2">
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <span className={`font-bold text-lg ${status.color}`}>
              {status.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
