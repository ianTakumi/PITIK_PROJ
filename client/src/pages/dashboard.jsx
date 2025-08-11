import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ChickenHeight from "../components/ChickenHeight";
import WaterLevel from "../components/WaterLevel";
import ThroughBeam from "../components/ThroughBeam";
import LoadCellStepper from "../components/LoadCellStepper";
import FeedWeightMonitor from "../components/FeedWeight";
import RaspiCam from "../components/RaspiCam";
import axiosInstance from "../utils/axios";

export default function Dashboard() {
  const [distance, setDistance] = useState(0);

  // Chicken weight (platform)
  const [weight, setWeight] = useState(0);
  const [loadCellHistory, setLoadCellHistory] = useState([]);

  // Feed tray weight
  const [feedWeight, setFeedWeight] = useState(0);
  const [feedHistory, setFeedHistory] = useState([]);

  const [waterLevel, setWaterLevel] = useState({
    percent: 0,
    status: "Unknown",
    raw: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

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

  useEffect(() => {
    const socket = io("http://192.168.1.244:5000/", {});

    socket.on("connect", () => {
      console.log("Connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      setIsConnected(false);
    });

    socket.on("new_sensor_data", (payload) => {
      const sensor = payload.data;
      console.log(sensor);
      if (sensor.type === "ultrasonic") {
        setDistance(45.72 - sensor.value);
      } else if (sensor.type === "water_level") {
        setWaterLevel({
          percent: sensor.percent,
          status: sensor.status,
          raw: sensor.raw,
        });
      } else if (sensor.type === "loadcell_full") {
        setWeight(sensor.value); // chicken weight platform
      } else if (sensor.type === "loadcell_half") {
        setFeedWeight(sensor.value); // feed tray weight
      } else if (sensor.type === "chicken_shower") {
        setThroughBeamReadings(sensor.value);
      }
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchLatestUltrasonic = async () => {
    const res = await axiosInstance.get("/sensors/ultrasonic");
    setDistance(res.data[0]?.value || 0);
    setUltrasonicReadings(res.data);
  };

  const fetchLatestWaterLevel = async () => {
    const res = await axiosInstance.get("/sensors/capacitive-water-level");
    setWaterLevel({
      percent: res.data[0]?.percent || 0,
      status: res.data[0]?.status || "Unknown",
      raw: res.data[0]?.raw || 0,
    });
  };

  const fetchLatestThroughBeam = async () => {
    const res = await axiosInstance.get("/sensors/through-beam");
    setThroughBeamReadings(res.data);
  };

  const fetchLatestLoadCell = async () => {
    const res = await axiosInstance.get("/sensors/load-cell");
    setLoadCellHistory(res.data);
    if (res.data[0]?.value) {
      setWeight(res.data[0].value);
    }
  };

  const fetchLatestFeedWeight = async () => {
    const res = await axiosInstance.get("/sensors/platform-load-cell");
    setFeedHistory(res.data);
    if (res.data[0]?.value) {
      setFeedWeight(res.data[0].value);
    }
  };

  useEffect(() => {
    fetchLatestUltrasonic();
    fetchLatestWaterLevel();
    fetchLatestThroughBeam();
    fetchLatestLoadCell();
    fetchLatestFeedWeight();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4 sm:p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                🐔 PITIK
              </h1>
              <p className="text-lg text-gray-600 font-medium mt-1">
                Smart Chicken Monitoring System
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
                  {isConnected ? "🟢 Live" : "🔴 Offline"}
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
