import React, { useState, useEffect, useRef } from "react";
import ChickenHeight from "../components/ChickenHeight";
import WaterLevel from "../components/WaterLevel";
import ThroughBeam from "../components/ThroughBeam";
import LoadCellStepper from "../components/LoadCellStepper";
import FeedWeightMonitor from "../components/FeedWeight";
import RaspiCam from "../components/RaspiCam";

export default function Dashboard() {
  const [distance, setDistance] = useState(12.5);

  // Chicken weight (platform)
  const [weight, setWeight] = useState(350);
  const [loadCellHistory, setLoadCellHistory] = useState([]);

  // Feed tray weight
  const [feedWeight, setFeedWeight] = useState(1250);
  const [feedHistory, setFeedHistory] = useState([]);

  const [waterLevel, setWaterLevel] = useState({
    percent: 85,
    status: "Good",
    raw: 820,
  });

  const [isConnected, setIsConnected] = useState(true);

  const [ultrasonicReadings, setUltrasonicReadings] = useState([]);
  const [waterLevelReadings, setWaterLevelReadings] = useState([]);
  const [throughBeamReadings, setThroughBeamReadings] = useState([]);

  // Real-time clock states
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString()
  );

  useEffect(() => {
    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setCurrentDate(new Date().toLocaleDateString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Generate mock ultrasonic data
  const generateUltrasonicData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 20; i++) {
      const time = new Date(now - i * 3600000); // Last 20 hours
      const value = 12.5 + (Math.random() * 2 - 1); // Random between 11.5-13.5
      data.push({
        id: i,
        value: parseFloat(value.toFixed(1)),
        timestamp: time.toISOString(),
        type: "ultrasonic",
      });
    }
    return data;
  };

  // Generate mock water level data
  const generateWaterLevelData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 15; i++) {
      const time = new Date(now - i * 1800000); // Last 7.5 hours
      const percent = 70 + Math.random() * 30; // Random between 70-100%
      data.push({
        id: i,
        percent: Math.round(percent),
        status: percent > 85 ? "Good" : percent > 50 ? "Low" : "Critical",
        raw: Math.floor(percent * 9.65),
        timestamp: time.toISOString(),
      });
    }
    return data;
  };

  // Generate mock through-beam data
  const generateThroughBeamData = () => {
    const data = [];
    const now = new Date();
    let count = 0;
    for (let i = 0; i < 24; i++) {
      const time = new Date(now - i * 3600000); // Last 24 hours
      // Randomly simulate chicken passing through
      if (Math.random() > 0.6) {
        count++;
        data.push({
          id: i,
          timestamp: time.toISOString(),
          value: true,
          count: count,
        });
      }
    }
    return data;
  };

  // Generate mock load cell data (chicken weight)
  const generateLoadCellData = () => {
    const data = [];
    const now = new Date();
    let baseWeight = 350;
    for (let i = 0; i < 30; i++) {
      const time = new Date(now - i * 7200000); // Last 60 hours
      // Simulate gradual weight gain with some fluctuation
      baseWeight += Math.random() * 2;
      const fluctuation = Math.random() * 10 - 5; // -5 to +5
      const value = baseWeight + fluctuation;
      data.push({
        id: i,
        value: parseFloat(value.toFixed(1)),
        timestamp: time.toISOString(),
        type: "loadcell_full",
      });
    }
    return data;
  };

  // Generate mock feed weight data
  const generateFeedWeightData = () => {
    const data = [];
    const now = new Date();
    let baseWeight = 1250;
    for (let i = 0; i < 40; i++) {
      const time = new Date(now - i * 1080000); // Last 12 hours
      // Simulate feeding patterns: weight decreases over time, then refills
      if (i % 8 === 0) {
        baseWeight = 1500; // Refill
      } else {
        baseWeight -= Math.random() * 30;
      }
      const value = Math.max(200, baseWeight); // Don't go below 200g
      data.push({
        id: i,
        value: parseFloat(value.toFixed(1)),
        timestamp: time.toISOString(),
        type: "loadcell_half",
      });
    }
    return data;
  };

  useEffect(() => {
    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      // Update ultrasonic with slight variation
      setDistance((prev) => {
        const change = Math.random() * 0.4 - 0.2; // -0.2 to +0.2
        return parseFloat((prev + change).toFixed(1));
      });

      // Update weight with gradual increase
      setWeight((prev) => {
        const change = Math.random() * 0.5; // 0 to 0.5g increase
        return parseFloat((prev + change).toFixed(1));
      });

      // Update feed weight (slow decrease)
      setFeedWeight((prev) => {
        const change = Math.random() * 2; // 0 to 2g decrease per minute
        return parseFloat(Math.max(200, prev - change).toFixed(1));
      });

      // Update water level (very slow decrease)
      setWaterLevel((prev) => {
        const newPercent = Math.max(20, prev.percent - Math.random() * 0.1);
        return {
          percent: parseFloat(newPercent.toFixed(1)),
          status:
            newPercent > 85 ? "Good" : newPercent > 50 ? "Low" : "Critical",
          raw: Math.floor(newPercent * 9.65),
        };
      });

      // Simulate occasional through-beam triggers
      if (Math.random() > 0.95) {
        // 5% chance per interval
        setThroughBeamReadings((prev) => {
          const newReading = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            value: true,
            count: prev.length > 0 ? prev[0].count + 1 : 1,
          };
          return [newReading, ...prev.slice(0, 9)];
        });
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    // Initialize with mock data
    setUltrasonicReadings(generateUltrasonicData());
    setWaterLevelReadings(generateWaterLevelData());
    setThroughBeamReadings(generateThroughBeamData());
    setLoadCellHistory(generateLoadCellData());
    setFeedHistory(generateFeedWeightData());
  }, []);

  // Mock functions that simulate API calls
  const fetchLatestUltrasonic = async () => {
    console.log("Mock: Fetching ultrasonic data");
    setUltrasonicReadings(generateUltrasonicData());
    return { data: generateUltrasonicData() };
  };

  const fetchLatestWaterLevel = async () => {
    console.log("Mock: Fetching water level data");
    setWaterLevelReadings(generateWaterLevelData());
    return { data: generateWaterLevelData() };
  };

  const fetchLatestThroughBeam = async () => {
    console.log("Mock: Fetching through-beam data");
    setThroughBeamReadings(generateThroughBeamData());
    return { data: generateThroughBeamData() };
  };

  const fetchLatestLoadCell = async () => {
    console.log("Mock: Fetching load cell data");
    const newData = generateLoadCellData();
    setLoadCellHistory(newData);
    if (newData[0]?.value) {
      setWeight(newData[0].value);
    }
    return { data: newData };
  };

  const fetchLatestFeedWeight = async () => {
    console.log("Mock: Fetching feed weight data");
    const newData = generateFeedWeightData();
    setFeedHistory(newData);
    if (newData[0]?.value) {
      setFeedWeight(newData[0].value);
    }
    return { data: newData };
  };

  // Simulate connection status changes
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        // 10% chance to toggle connection
        setIsConnected((prev) => !prev);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(connectionInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                🐔 PITIK (DEMO)
              </h1>
              <p className="text-lg text-gray-600 font-medium mt-1">
                Smart Chicken Monitoring System - Mock Data
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Time & Date */}
              <div className="text-center sm:text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {currentTime}
                </div>
                <div className="text-sm text-gray-500">{currentDate}</div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-white to-gray-50 shadow-lg border border-gray-200">
                <div
                  className={`w-3 h-3 rounded-full shadow-lg ${
                    isConnected
                      ? "bg-gradient-to-r from-green-400 to-green-500 animate-pulse"
                      : "bg-gradient-to-r from-red-400 to-red-500"
                  }`}
                ></div>
                <span
                  className={`font-semibold ${
                    isConnected ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isConnected ? "🟢 Live (Mock)" : "🔴 Offline (Mock)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80">
            <ChickenHeight distance={distance} history={ultrasonicReadings} />
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80">
            <WaterLevel waterLevel={waterLevel} />
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80">
            <ThroughBeam readings={throughBeamReadings} />
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80">
            <LoadCellStepper
              weight={weight}
              height={distance}
              history={loadCellHistory}
            />
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80">
            <FeedWeightMonitor weight={feedWeight} history={feedHistory} />
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80">
            <RaspiCam />
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl shadow-xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">{distance.toFixed(1)}"</div>
              <div className="text-sm opacity-80">Height</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{weight.toFixed(1)}g</div>
              <div className="text-sm opacity-80">Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{waterLevel.percent}%</div>
              <div className="text-sm opacity-80">Water</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{feedWeight.toFixed(1)}g</div>
              <div className="text-sm opacity-80">Feed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
