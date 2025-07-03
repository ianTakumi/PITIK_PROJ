import RPi.GPIO as GPIO
import time

# GPIO pin assignments
SENSOR_PIN = 17  # Through-beam sensor input
RELAY_PIN = 27   # Relay control output

# Setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN)
GPIO.setup(RELAY_PIN, GPIO.OUT)

try:
    while True:
        sensor_state = GPIO.input(SENSOR_PIN)

        if sensor_state == 0:  # 0 = beam interrupted (someone inside)
            print("🟢 Beam broken — Pump ON")
            GPIO.output(RELAY_PIN, GPIO.HIGH)
        else:  # 1 = beam restored (no one inside)
            print("⚪ Beam clear — Pump OFF")
            GPIO.output(RELAY_PIN, GPIO.LOW)

        time.sleep(0.1)  # adjust responsiveness

except KeyboardInterrupt:
    print("\n🛑 Program stopped by user.")

finally:
    GPIO.output(RELAY_PIN, GPIO.LOW)
    GPIO.cleanup()
