import RPi.GPIO as GPIO
import time

SENSOR_PIN = 17  # GPIO pin connected to 'S' pin

GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN)

try:
    while True:
        water_detected = GPIO.input(SENSOR_PIN)

        if water_detected == GPIO.HIGH:
            print("? Water detected!")
        else:
            print("?? No water detected!")

        time.sleep(1)

except KeyboardInterrupt:
    print("Exiting...")
finally:
    GPIO.cleanup()
