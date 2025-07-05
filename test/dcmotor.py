import RPi.GPIO as GPIO
import time

RELAY_PIN = 17  # You can change this based on your wiring

# Setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)

print("Motor ON")
GPIO.output(RELAY_PIN, GPIO.HIGH)  # Relay ON (Motor starts)
time.sleep(5)  # Motor runs for 5 seconds

print("Motor OFF")
GPIO.output(RELAY_PIN, GPIO.LOW)   # Relay OFF (Motor stops)
time.sleep(2)

# Cleanup
GPIO.cleanup()