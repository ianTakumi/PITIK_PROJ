import time
from hx711 import HX711

# Define GPIO pins (BCM mode)
DT_PIN = 5     # Connect to HX711 DT (data)
SCK_PIN = 6    # Connect to HX711 SCK (clock)

# Initialize HX711
hx = HX711(dout_pin=DT_PIN, pd_sck_pin=SCK_PIN)

# Set reading format: Most load cells use MSB format
hx.set_reading_format("MSB", "MSB")

# Tare (zero the scale)
print("Taring... remove any weight.")
hx.zero()
time.sleep(2)
print("Tare complete.")

# Optional: Set scale ratio after calibration
# Replace with your own calibration factor
# (grams per raw unit)
calibration_factor = 7050.0
hx.set_scale_ratio(calibration_factor)

# Main loop
try:
    while True:
        weight = hx.get_weight_mean(5)  # Average of 5 readings
        print(f"Weight: {weight:.2f} g")
        time.sleep(1)

except (KeyboardInterrupt, SystemExit):
    print("\nCleaning up...")
    hx.power_down()
    hx.power_up()
    print("Exiting.")
