import RPi.GPIO as GPIO
import time
from hx711 import HX711

# --- GPIO Setup ---
RELAY_PIN = 17  # GPIO pin for relay
GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)
GPIO.output(RELAY_PIN, GPIO.LOW)  # Ensure relay is off

# --- HX711 Setup ---
hx = HX711(dout_pin=5, pd_sck_pin=6)
hx.set_reading_format("MSB", "MSB")
hx.set_reference_unit(100)  # Adjust this after calibration

hx.reset()
hx.tare()

print("System ready. Waiting for weight...")

try:
    while True:
        weight = max(0, int(hx.get_weight(5)))
        print(f"Weight: {weight} grams")

        # Trigger motor if weight exceeds threshold
        if weight >= 200:  # Set your desired weight trigger
            print("Weight threshold reached. Activating motor...")
            GPIO.output(RELAY_PIN, GPIO.HIGH)
            time.sleep(3)  # Motor runs for 3 seconds
            GPIO.output(RELAY_PIN, GPIO.LOW)
            print("Motor off.")
        
        time.sleep(0.5)

except KeyboardInterrupt:
    print("\nExiting...")
    GPIO.cleanup()
