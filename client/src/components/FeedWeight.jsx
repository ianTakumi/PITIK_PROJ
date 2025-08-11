import React, { useState } from "react";
import {
  Scale,
  AlertTriangle,
  CheckCircle,
  History,
  ChevronDown,
} from "lucide-react";

export default function FeedWeightMonitor({ weight = 50 }) {
  // Define thresholds (adjust based on your actual platform's calibration)
  const getStatus = () => {
    if (weight < 200)
      return {
        text: "EMPTY — REFILL NEEDED!",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: AlertTriangle,
      };
    if (weight < 1000)
      return {
        text: "LOW FEED",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: AlertTriangle,
      };
    return {
      text: "ENOUGH FEED",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: CheckCircle,
    };
  };

  const getFeedLevel = () => {
    if (weight < 200) return "Empty";
    if (weight < 500) return "Very Low";
    if (weight < 1000) return "Low";
    if (weight < 2000) return "Good";
    return "Full";
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Scale className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Feed Tray Monitor
            </h2>
            <p className="text-sm text-gray-600">50kg Load Cell Platform</p>
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
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold inline-block border border-green-200">
              {getFeedLevel()} Level
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
