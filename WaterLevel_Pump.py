import serial
import time

# Connect to the ESP32's USB serial
ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=1)
time.sleep(2)  # wait for ESP32 to reset

try:
    while True:
        if ser.in_waiting:
            line = ser.readline().decode('utf-8').strip()
            if line.isdigit():
                value = int(line)
                print(f"Water Sensor Raw Value: {value}")
except KeyboardInterrupt:
    ser.close()
    print("Stopped.")