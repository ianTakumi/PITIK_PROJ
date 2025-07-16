import RPi.GPIO as GPIO
import time

# GPIO pin assignments
SENSOR_PIN = 17  # Through-beam sensor input (IR receiver)
RELAY_PIN = 27   # Relay output to control the pump

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN)      # Input from sensor
GPIO.setup(RELAY_PIN, GPIO.OUT)      # Output to relay

print("🔧 System initialized. Waiting for sensor input...")

try:
    while True:
        sensor_state = GPIO.input(SENSOR_PIN)

        if sensor_state == GPIO.HIGH:
            # Beam is clear → no object → turn ON relay
            print("🟢 Beam clear — Pump Off")
            GPIO.output(RELAY_PIN, GPIO.HIGH)
        else:
            # Beam is blocked → object detected → turn OFF relay
            print("🔴 Object detected — Pump On")
            GPIO.output(RELAY_PIN, GPIO.LOW)

        time.sleep(0.1)

except KeyboardInterrupt:
    print("\n🛑 Program stopped by user.")

finally:
    GPIO.output(RELAY_PIN, GPIO.LOW)  # Ensure pump is off
    GPIO.cleanup()
    print("✅ GPIO cleanup complete.")
