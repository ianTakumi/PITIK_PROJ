import Sensor from "../model/sensor.model.js";

// Get all raspberry pi camera inputs
export const getRaspiCamInputs = async (req, res) => {
  try {
    const inputs = await Sensor.find({ type: "raspiCam" });
    if (inputs.length === 0) {
      return res
        .status(404)
        .json({ message: "No Raspberry Pi camera inputs found" });
    }
    res.status(200).json({
      data: inputs,
      message: "Successfully fetched Raspberry Pi camera inputs",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all records of Capacitivte water level sensors
export const getCapacitiveWaterLevelSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find({ type: "capacitiveWaterLevel" });
    if (sensors.length === 0) {
      return res
        .status(404)
        .json({ message: "No capacitive water level sensors found" });
    }
    res.status(200).json({
      data: sensors,
      message: "Successfully fetched capacitive water level sensors",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all records of ultrasonic
export const getUltrasonicSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find({ type: "ultrasonic" });
    if (sensors.length === 0) {
      return res.status(404).json({ message: "No ultrasonic sensors found" });
    }
    res.status(200).json({
      data: sensors,
      message: "Successfully fetched ultrasonic sensors",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all records of load cell sensor
export const getLoadCellSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find({ type: "loadCell" });
    if (sensors.length === 0) {
      return res.status(404).json({ message: "No load cell sensors found" });
    }
    res.status(200).json({
      data: sensors,
      message: "Successfully fetched load cell sensors",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all records of platform type load cell
export const getPlatformLoadCellSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find({ type: "platformLoadCell" });
    if (sensors.length === 0) {
      return res
        .status(404)
        .json({ message: "No platform load cell sensors found" });
    }
    res.status(200).json({
      data: sensors,
      message: "Successfully fetched platform load cell sensors",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all records of through beam sensor
export const getThroughBeamSensors = async (req, res) => {
  try {
    const sensors = await Sensor.find({ type: "throughBeam" });
    if (sensors.length === 0) {
      return res.status(404).json({ message: "No through beam sensors found" });
    }
    res.status(200).json({
      data: sensors,
      message: "Successfully fetched through beam sensors",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new record of a sensor
export const createSensor = async (req, res) => {
  try {
    const { type, value } = req.body;

    if (!type || value === undefined) {
      return res.status(400).json({ message: "Type and value are required" });
    }

    const newSensor = new Sensor({
      type,
      value,
      timestamp: new Date(),
    });

    await newSensor.save();

    // 🔄 Emit only to that specific type's update channel
    const allowedTypes = [
      "ultrasonic",
      "loadCell",
      "platformLoadCell",
      "raspicam",
      "throughbeam",
      "capacitiveWaterLevel",
    ];

    if (allowedTypes.includes(type)) {
      req.io.emit(`${type}-update`, newSensor);
    }

    res.status(201).json({
      data: newSensor,
      message: "Sensor record created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
