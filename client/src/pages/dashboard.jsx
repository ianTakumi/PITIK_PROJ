import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ChickenHeight from "../components/ChickenHeight";
import WaterLevel from "../components/WaterLevel";
import axiosInstance from "../utils/axios";
export default function Dashboard() {
  const [distance, setDistance] = useState(0);
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

  useEffect(() => {
    const socket = io("http://192.168.100.20:5000");

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

      if (sensor.type === "ultrasonic") {
        setDistance(sensor.value);
      } else if (sensor.type === "water_level") {
        setWaterLevel({
          percent: sensor.percent,
          status: sensor.status,
          raw: sensor.raw,
        });
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
    const res = await axiosInstance.get("/sensors/ultrasonic"); // last 5
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

  useEffect(() => {
    fetchLatestUltrasonic();
    fetchLatestWaterLevel();
    fetchLatestThroughBeam();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      <div className="max-w-4xl mx-auto text-center mb-6">
        <h1 className="text-4xl font-bold">PITIK - Dashboard</h1>
        <div className="flex justify-center items-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChickenHeight distance={distance} />
        <WaterLevel waterLevel={waterLevel} />
      </div>
    </div>
  );
}
