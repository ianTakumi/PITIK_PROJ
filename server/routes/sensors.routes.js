import express from "express";
import {
  getRaspiCamInputs,
  getCapacitiveWaterLevelSensors,
  getUltrasonicSensors,
  getLoadCellSensors,
  getPlatformLoadCellSensors,
  getThroughBeamSensors,
  createSensor,
} from "../controller/sensors.controllers.js";

const router = express.Router();

// Get all records of raspi cam inputs
router.get("/raspi-cam", getRaspiCamInputs);

// Get all records of capacitive water level sensors
router.get("/capacitive-water-level", getCapacitiveWaterLevelSensors);

// Get all records of ultrasonic sensors
router.get("/ultrasonic", getUltrasonicSensors);

// Get all records of load cell sensors
router.get("/load-cell", getLoadCellSensors);

// Get all records of platform load cell sensors
router.get("/platform-load-cell", getPlatformLoadCellSensors);

// Get all records of through beam sensors
router.get("/through-beam", getThroughBeamSensors);

// Create a new sensor record
router.post("/", createSensor);

export default router;
