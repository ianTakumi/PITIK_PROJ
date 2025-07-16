import RPi.GPIO as GPIO
import time

# Define the GPIO pin connected to the relay's IN pin
RELAY_PIN = 27  # Change if your relay is connected to a different pin

# Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)

try:
    print("💧 Activating water pump on startup...")

    # Turn ON the pump
    GPIO.output(RELAY_PIN, GPIO.HIGH)  # If your relay is active LOW, use GPIO.LOW instead
    print("🟢 Pump is ON")

    # Keep the program running
    while True:
        time.sleep(1)  # Keeps the pump running

except KeyboardInterrupt:
    print("\n🛑 Program stopped by user.")

finally:
    # Turn OFF the pump and cleanup
    GPIO.output(RELAY_PIN, GPIO.LOW)
    GPIO.cleanup()
    print("🔴 Pump is OFF. GPIO cleaned up.")
