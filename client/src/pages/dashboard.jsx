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

  useEffect(() => {
    const socket = io("http://192.168.1.244:5000", {});

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
      } else if (sensor.type === "load_cell") {
        setWeight(sensor.value); // chicken weight platform
      } else if (sensor.type === "load_cell_feed") {
        setFeedWeight(sensor.value); // feed tray weight
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
        <ChickenHeight distance={distance} history={ultrasonicReadings} />
        <WaterLevel waterLevel={waterLevel} />
        <ThroughBeam readings={throughBeamReadings} />
        <LoadCellStepper
          weight={weight}
          height={distance}
          history={loadCellHistory}
        />
        <FeedWeightMonitor weight={feedWeight} history={feedHistory} />
        <RaspiCam />
      </div>
    </div>
  );
}
