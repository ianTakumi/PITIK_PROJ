import RPi.GPIO as GPIO
from hx711 import HX711
import time
import statistics

# ------------------ CONFIGURATION ------------------
SCK = 5
DT = 6
KNOWN_WEIGHT_GRAMS = 205  # Known calibration weight (your phone)

GPIO.setmode(GPIO.BCM)
hx = HX711(dout_pin=DT, pd_sck_pin=SCK)

# ------------------ FUNCTIONS ------------------

def get_average_reading(samples=15, delay=0.1):
    values = []
    for _ in range(samples):
        raw = hx.get_raw_data_mean()
        if raw is not None and raw is not False:
            values.append(raw)
        time.sleep(delay)
    return statistics.mean(values) if values else None

# ------------------ CALIBRATION ------------------

print("Step 1: Remove all weight from the scale.")
time.sleep(3)
baseline = get_average_reading()

if baseline is None:
    print("Failed to get baseline. Exiting.")
    GPIO.cleanup()
    exit()

print(f"Baseline (zero offset): {baseline:.2f}")
print("\nStep 2: Place the known 205g object on the scale.")
time.sleep(5)  # Give time to place the phone

known_weight_raw = get_average_reading()

if known_weight_raw is None:
    print("Failed to read known weight. Exiting.")
    GPIO.cleanup()
    exit()

# Calculate conversion ratio
adjusted = known_weight_raw - baseline
conversion_ratio = adjusted / KNOWN_WEIGHT_GRAMS

print(f"\nCalibration complete!")
print(f"Raw value for 205g: {adjusted:.2f}")
print(f"Conversion ratio: {conversion_ratio:.4f} units per gram\n")

# ------------------ WEIGHING ------------------

print("Starting weighing... (outputs in grams)\n")

try:
    while True:
        raw = hx.get_raw_data_mean()
        if raw is not None and raw is not False:
            adjusted = raw - baseline
            grams = adjusted / conversion_ratio

            # Optional: ignore small noise (±5g)
            if abs(grams) < 5:
                print("Weight: 0.00 g")
            else:
                print(f"Weight: {grams:.2f} g")
        else:
            print("Error reading HX711.")

        time.sleep(1)

except KeyboardInterrupt:
    print("\nExiting. Cleaning up GPIO...")
    GPIO.cleanup()
