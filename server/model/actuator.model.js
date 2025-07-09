import mongoose from "mongoose";

const actuatorSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "dc_motor",
      "servo_motor",
      "stepper_motor",
      "dc_pump",
      "gsm_module",
      "diaphragm_pump",
    ],
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "unspecified",
  },
  actions: [
    {
      status: {
        type: String,
        enum: ["activated", "deactivated"],
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      trigger: {
        type: String,
        default: "manual",
      },
    },
  ],
});

const Actuator = mongoose.model("Actuator", actuatorSchema);
export default Actuator;
