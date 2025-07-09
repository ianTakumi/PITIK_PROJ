import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,  
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [distance, setDistance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const socketRef = useRef(null);

  useEffect(() => {
    const connectSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        const socket = io("http://localhost:5000");

        socket.on("connect", () => {
          console.log("Connected to server");
          setIsConnected(true);
        });

        socket.on("disconnect", () => {
          console.log("Disconnected from server");
          setIsConnected(false);
        });

        socket.on("ultrasonic-update", (data) => {
          console.log("Received sensor data:", data);
          setDistance(data.distance);
          setLastUpdate(new Date());

          setSensorData((prevData) => {
            const newData = [
              ...prevData,
              {
                time: new Date().toLocaleTimeString(),
                distance: data.distance,
                timestamp: Date.now(),
              },
            ];
            // Keep only last 20 readings
            return newData.slice(-20);
          });
        });

        socketRef.current = socket;

        setIsConnected(false);
      } catch (error) {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getDistanceColor = (dist) => {
    if (dist < 10) return "text-red-500";
    if (dist < 50) return "text-orange-500";
    if (dist < 100) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusText = (dist) => {
    if (dist < 10) return "VERY CLOSE";
    if (dist < 50) return "CLOSE";
    if (dist < 100) return "MODERATE";
    return "FAR";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Ultrasonic Sensor Dashboard
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-300">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Main Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Distance Display */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Current Distance
              </h2>
              <div
                className={`text-8xl font-bold mb-4 ${getDistanceColor(
                  distance
                )}`}
              >
                {distance}
              </div>
              <div className="text-3xl text-gray-300 mb-2">cm</div>
              <div
                className={`text-xl font-semibold ${getDistanceColor(
                  distance
                )}`}
              >
                {getStatusText(distance)}
              </div>
            </div>
          </div>

          {/* Status Panel */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">
              Sensor Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Status:</span>
                <span
                  className={`font-semibold ${
                    isConnected ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isConnected ? "Active" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Update:</span>
                <span className="text-white text-sm">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Range:</span>
                <span className="text-white">2-400 cm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Accuracy:</span>
                <span className="text-white">±3mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Distance Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 400]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Readings */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">
            Recent Readings
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sensorData.slice(-6).map((reading, index) => (
              <div key={reading.timestamp} className="text-center">
                <div className="text-2xl font-bold text-white">
                  {reading.distance}
                </div>
                <div className="text-sm text-gray-400">cm</div>
                <div className="text-xs text-gray-500">{reading.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Integration Instructions */}
        <div className="mt-6 bg-blue-500/10 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">
            Backend Integration
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            Dashboard is ready to connect to your Express/Socket.IO backend. To
            enable real-time updates:
          </p>
          <div className="space-y-2">
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-green-400 text-sm font-semibold">
                1. Install socket.io-client in your React app:
              </p>
              <code className="text-gray-300 text-sm">
                npm install socket.io-client
              </code>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-green-400 text-sm font-semibold">
                2. Your backend should emit data like this:
              </p>
              <code className="text-gray-300 text-sm">
                {`io.emit('ultrasonic-update', { distance: 150 }); // cm`}
              </code>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-green-400 text-sm font-semibold">
                3. Update server URL in the dashboard:
              </p>
              <code className="text-gray-300 text-sm">
                {`const socket = io('http://localhost:5000');`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
