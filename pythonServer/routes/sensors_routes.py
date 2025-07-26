from flask import Blueprint, request, jsonify
from extensions import socketio
from datetime import datetime
from gpiozero import OutputDevice, Servo
import cv2
import numpy as np

import os
from dotenv import load_dotenv
import requests
import vonage
import time

load_dotenv()

client = vonage.Client(key="845832bb", secret="JPRcfKt7f2JrwPm8")
sms = vonage.Sms(client)

sensors_bp = Blueprint('sensors', __name__)
relay = OutputDevice(17, active_high=False, initial_value=False)  # relay OFF at start
relayThroughBeam = OutputDevice(27, active_high=False, initial_value=False)
relayDC = OutputDevice(26, active_high=False, initial_value=False)

servo = Servo(21)  # Software PWM

stepper_pins = [
    OutputDevice(5),   # IN1
    OutputDevice(6),   # IN2
    OutputDevice(13),  # IN3
    OutputDevice(19)   # IN4
]

half_step_sequence = [
    [1,0,0,0],
    [1,1,0,0],
    [0,1,0,0],
    [0,1,1,0],
    [0,0,1,0],
    [0,0,1,1],
    [0,0,0,1],
    [1,0,0,1],
]

def rotate_stepper_motor(steps=512, delay=0.002):
    print("Rotating stepper motor...")
    for _ in range(steps):
        for step in half_step_sequence:
            for pin, value in zip(stepper_pins, step):
                pin.value = value
            time.sleep(delay)
    print("Stepper motor rotation complete.")

def push_egg():
    try:
        print("🥚 Pushing egg with servo...")
        servo.max()     # Push position
        time.sleep(1)   # Hold position for 1 second
        servo.min()     # Reset to start
        print("🔄 Servo returned to initial position.")
    except Exception as e:
        print("❌ Error in push_egg():", e)

def format_data(data):
    for item in data:
        item['_id'] = str(item['_id'])
    return data

# Sensor routes
@sensors_bp.route('/raspi-cam', methods=['GET'])
def get_raspi_cam_inputs():
    data = list(request.db['raspi_cam'].find())
    return jsonify(format_data(data))

@sensors_bp.route('/capacitive-water-level', methods=['GET'])
def get_capacitive_water_level_sensors():
    data = list(request.db['capacitive_water_level'].find())
    return jsonify(format_data(data))

@sensors_bp.route('/ultrasonic', methods=['GET'])
def get_ultrasonic_sensor():
    try:
        latest_data = request.db['all_sensors'].find_one(
            {"type": "ultrasonic"}
        )
        if latest_data:
            return jsonify(format_data([latest_data]))  # still using format_data for consistency
        else:
            return jsonify({"error": "No ultrasonic data found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@sensors_bp.route('/load-cell', methods=['GET'])
def get_load_cell_sensors():
    data = list(request.db['load_cell'].find())
    return jsonify(format_data(data))

@sensors_bp.route('/platform-load-cell', methods=['GET'])
def get_platform_load_cell_sensors():
    data = list(request.db['platform_load_cell'].find())
    return jsonify(format_data(data))

@sensors_bp.route('/through-beam', methods=['GET'])
def get_through_beam_sensors():
    data = list(request.db['through_beam'].find())
    return jsonify(format_data(data))

@sensors_bp.route('/raspi_cam', methods=['POST'])
def detect_eggs_from_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    # Read the image using OpenCV
    file_bytes = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if image is None:
        return jsonify({'error': 'Failed to decode image'}), 400

    # Convert to HSV for better color detection
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define white range
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 40, 255])
    mask = cv2.inRange(hsv, lower_white, upper_white)

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    egg_count = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 1000:  # threshold may vary
            egg_count += 1
            cv2.drawContours(image, [cnt], -1, (0, 255, 0), 2)

    # Optional: Save result image for debugging
    # cv2.imwrite("debug_detected.jpg", image)

    # Emit real-time event
    socketio.emit('egg_detection', {
        'message': f'{egg_count} egg(s) detected',
        'count': egg_count
    })

    return jsonify({
        'message': 'Image processed',
        'egg_count': egg_count
    })

# Relay functions
def activate_relay():
    try:
        relay.on()
        print("Relay ON")
    except Exception as e:
        print("Error activating relay:", e)

def deactivate_relay():
    try:
        relay.off()
        print("Relay OFF")
    except Exception as e:
        print("Error deactivating relay:", e)

def activate_relayThroughbeam():
    try:
        relayThroughBeam.on()
        print("Relay through beam on")
    except Exception as e:
        print("Error activating relay through beam", e)

def deactivate_relayThroughbeam():
    try:
        relayThroughBeam.off()
        print("Relay through beam off")
    except Exception as e:
        print("Error deactivating relay through beam", e)

def activate_relayDCmotor():
    try:
        relayDC.on()
        print("DC motor relay ON")
    except Exception as e:
        print("Error activating DC motor relay:", e)

def deactivate_relayDCmotor():
    try:
        relayDC.off()
        print("DC motor relay OFF")
    except Exception as e:
        print("Error deactivating DC motor relay:", e)

# POST endpoint to handle sensor input
@sensors_bp.route('/', methods=['POST'])
def create_sensor():
    sensor_data = request.json
    print(sensor_data)
    sensor_data['timestamp'] = datetime.now().isoformat()

    result = request.db['all_sensors'].insert_one(sensor_data)
    sensor_data['_id'] = str(result.inserted_id)

    # Chicken shower trigger
    if sensor_data.get('type') == 'chicken_shower':
        if sensor_data.get('value') == "detected":
            activate_relayThroughbeam()
        elif sensor_data.get('value') == "clear":
            deactivate_relayThroughbeam()

    # Full load cell - chicken ready to sell
    if sensor_data.get('type') == 'loadcell_full':
        try:
            weight_grams = float(sensor_data.get('value', 0))
            weight_kg = weight_grams / 1000
            print(f"Measured weight: {weight_kg:.2f} kg")

            if weight_kg >= 1.5:
                print("✅ Chicken weight >= 1. 5kg — activating stepper motor.")
                rotate_stepper_motor()
            else:
                print("⚖️ Chicken not ready — weight is below 1.5kg.")
        except Exception as e:
            print(f"Error processing loadcell_full: {e}")

    # Half load cell - egg drop
    if sensor_data.get('type') == 'loadcell_half':
        try:
            weight_grams = float(sensor_data.get('value', 0))
            print(f"Half load cell weight: {weight_grams:.2f} g")

            if weight_grams < 3:
                print("⚠️ Weight below 3g — activating DC relay.")
                activate_relayDCmotor()
            else:
                print("✅ Weight is sufficient — no action taken.")
                deactivate_relayDCmotor()
        except Exception as e:
            print(f"Error processing loadcell_half data: {e}")


        # Capacitive Water Level Sensor - Auto Refill Control
    if sensor_data.get('type') == 'water_level':
        try:
            water_level = float(sensor_data.get('percent', 0))
            print(f"📉 Water level: {water_level:.2f}")

            if water_level < 10:
                print("💧 Low water level detected — activating water pump relay.")
                activate_relay()
            else:
                print("🟡 Water level madami na boi.")
                deactivate_relay()

        except Exception as e:
            print(f"Error processing water level data: {e}")

    # Ultrasonic sensor - height detection
    if sensor_data.get('type') == 'ultrasonic':
        try:
            sensor_value = float(sensor_data.get('value', 0))
            total_height_cm = 45.72
            chicken_height = total_height_cm - sensor_value

            print(f"Measured chicken height: {chicken_height:.2f} cm")

            if chicken_height >= 25:
                message_text = f"🐔 Chicken is now {chicken_height:.2f} cm tall — ready for sale!"
                response = sms.send_message({
                    "from": "PITIK PROJECT",
                    "to": "639613886156",
                    "text": message_text,
                })

                if response["messages"][0]["status"] == "0":
                    print("✅ SMS sent successfully.")
                else:
                    print(f"❌ SMS failed: {response['messages'][0]['error-text']}")
            else:
                print("Chicken not ready yet (below 25 cm). No SMS sent.")
        except Exception as e:
            print(f"Error during SMS send or height calculation: {e}")

    socketio.emit('new_sensor_data', {
        'message': 'New sensor data received',
        'data': sensor_data
    })

    return jsonify({
        'message': 'Sensor data inserted',
        'id': str(result.inserted_id)
    })
