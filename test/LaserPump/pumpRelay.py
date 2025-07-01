import RPi.GPIO as GPIO
import time

RELAY_PIN = 27  # GPIO27 controls the relay module

GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)

print("? Relay Control Test Started")

try:
    while True:
        print("? Turning pump ON")
        GPIO.output(RELAY_PIN, GPIO.HIGH)  # Relay ON (may depend on relay logic)
        time.sleep(5)  # Pump runs for 5 seconds

        print("? Turning pump OFF")
        GPIO.output(RELAY_PIN, GPIO.LOW)   # Relay OFF
        time.sleep(5)

except KeyboardInterrupt:
    print("? Program stopped by user.")
finally:
    GPIO.output(RELAY_PIN, GPIO.LOW)  # Make sure pump is off
    GPIO.cleanup()
