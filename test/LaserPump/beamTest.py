import RPi.GPIO as GPIO
import time

SENSOR_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN)

try:
    while True:
        raw = GPIO.input(SENSOR_PIN)
        print(f"Sensor reading: {raw}")
        time.sleep(0.5)
except KeyboardInterrupt:
    GPIO.cleanup()