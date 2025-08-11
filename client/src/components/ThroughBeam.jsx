import React, { useState, useEffect } from "react";
import {
  User,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  HelpCircle,
} from "lucide-react";

export default function ShowerDashboard({ readings }) {
  const [isOccupied, setIsOccupied] = useState(false);
  const [usageTime, setUsageTime] = useState(0);
  const [sessionCount, setSessionCount] = useState(3);

  useEffect(() => {
    if (readings === 1) {
      // start timer
      const interval = setInterval(() => {
        setUsageTime((prev) => prev + 1);
      }, 1000);
      setIsOccupied(true);

      // cleanup function to clear timer kapag readings changes or component unmount
      return () => clearInterval(interval);
    } else {
      setIsOccupied(false);
      setUsageTime(0); // reset usageTime kapag hindi occupied
    }
  }, [readings]);

  const getOccupancyStatus = () => {
    if (isOccupied) {
      return {
        text: "OCCUPIED",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: User,
      };
    }

    return {
      text: "AVAILABLE",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: CheckCircle2,
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const occupancyStatus = getOccupancyStatus();
  const OccupancyIcon = occupancyStatus.icon;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Shower Occupancy Card */}
      <div className="bg-white rounded-2xl  overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 text-blue-600 flex items-center justify-center">
                  🚿
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Shower Status
              </h2>
            </div>
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </div>

          {/* Main Status Display */}
          <div
            className={`${occupancyStatus.bgColor} ${occupancyStatus.borderColor} border-2 rounded-xl p-6 mb-6`}
          >
            <div className="text-center">
              <OccupancyIcon
                className={`w-12 h-12 ${occupancyStatus.color} mx-auto mb-3`}
              />
              <p className={`text-3xl font-bold ${occupancyStatus.color} mb-2`}>
                {occupancyStatus.text}
              </p>
              <div className="bg-white rounded-lg px-3 py-1 inline-block">
                <span className="text-sm text-gray-600">
                  {isOccupied
                    ? `Active: ${formatTime(usageTime)}`
                    : "Ready to use"}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Session Progress
              </span>
              <span className="text-sm text-gray-600">
                {isOccupied ? formatTime(usageTime) : "0:00"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  usageTime > 300
                    ? "bg-red-500"
                    : usageTime > 180
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min((usageTime / 600) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">Quick Use</div>
              <div className="text-xs text-gray-500">&lt;5 min</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">
                Regular Use
              </div>
              <div className="text-xs text-gray-500">5-10 min</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="w-6 h-6 text-gray-600 mx-auto mb-2 flex items-center justify-center">
                🚿
              </div>
              <div className="text-sm font-medium text-gray-700">Long Use</div>
              <div className="text-xs text-gray-500">10-20 min</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">Extended</div>
              <div className="text-xs text-gray-500">&gt;20 min</div>
            </div>
          </div>

          {/* Session Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {sessionCount}
                </div>
                <div className="text-sm text-gray-600">Sessions Today</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {formatTime(usageTime * sessionCount)}
                </div>
                <div className="text-sm text-gray-600">Total Time Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
