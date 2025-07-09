import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "ultrasonic",
      "loadCell",
      "platformLoadCell",
      "raspicam",
      "throughbeam",
      "capacitiveWaterLevel",
    ],
  },
  value: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Sensor = mongoose.model("Sensor", sensorSchema);
export default Sensor;
