from flask import Blueprint, request, jsonify
from extensions import socketio
from datetime import datetime
from gpiozero import OutputDevice

sensors_bp = Blueprint('sensors', __name__)
relay = OutputDevice(26, active_high=False, initial_value=False)  # relay OFF at start

# Format MongoDB _id for JSON
def format_data(data):
    for item in data:
        item['_id'] = str(item['_id'])
    return data

# Routes to get sensor data
@sensors_bp.route('/raspi-cam', methods=['GET'])
def get_raspi_cam_inputs():
    data = list(request.db['raspi_cam'].find())
    return jsonify(format_data(data))

@sensors_bp.route('/capacitive-water-level', methods=['GET'])
def get_capacitive_water_level_sensors():
    data = list(request.db['capacitive_water_level'].find())
    return jsonify(format_data(data))

@sensors_bp.route('/ultrasonic', methods=['GET'])
def get_ultrasonic_sensors():
    data = list(request.db['ultrasonic'].find())
    return jsonify(format_data(data))

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

#  Relay control functions
def activate_relay():
    try:
        relay.on()  # LOW = ON
        print("Relay ON")
    except Exception as e:
        print("Error activating relay:", e)

def deactivate_relay():
    try:
        relay.off()  # HIGH = OFF
        print("Relay OFF")
    except Exception as e:
        print("Error deactivating relay:", e)

# Create sensor data
@sensors_bp.route('/', methods=['POST'])
def create_sensor():
    sensor_data = request.json
    sensor_data['timestamp'] = datetime.now().isoformat()

    # Insert into MongoDB
    result = request.db['all_sensors'].insert_one(sensor_data)
    sensor_data['_id'] = str(result.inserted_id)
    print(sensor_data)
      # Check sensor type and value to trigger relay
    if sensor_data.get('type') == 'water_level':
        try:
            value = float(sensor_data.get('percent', 0))
            if value > 25:
                print(f"Value is {value} > 50: Activating relay")
                activate_relay()
            else:
                print(f"Value is {value} <= 50: Deactivating relay")
                deactivate_relay()
        except ValueError:
            print("Invalid value format. Deactivating relay as fallback.")
            deactivate_relay()
    else:
        deactivate_relay()


    # Emit to connected clients via Socket.IO
    socketio.emit('new_sensor_data', {
        'message': 'New sensor data received',
        'data': sensor_data
    })

    return jsonify({
        'message': 'Sensor data inserted',
        'id': str(result.inserted_id)
    })
