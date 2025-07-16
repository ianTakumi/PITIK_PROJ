import RPi.GPIO as GPIO
from hx711 import HX711
import time
import statistics

# ------------------ CONFIGURATION ------------------
SCK = 5
DT = 6

IN1 = 17
IN2 = 18
IN3 = 27
IN4 = 22

# Chicken weight threshold in kg
WEIGHT_THRESHOLD_KG = 2.0

# Stepper settings
STEP_COUNT = 512  # One full rotation
STEP_DELAY = 0.002

# Stepper motor half-step sequence
STEPPER_SEQUENCE = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1]
]

GPIO.setmode(GPIO.BCM)

# Setup motor pins
for pin in [IN1, IN2, IN3, IN4]:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, 0)

# Initialize HX711
hx = HX711(dout_pin=DT, pd_sck_pin=SCK)

# ------------------ FUNCTIONS ------------------

def get_baseline(retries=5, delay=0.5):
    print("Reading baseline... Remove all weight.")
    time.sleep(2)
    for i in range(retries):
        try:
            baseline = hx.get_raw_data_mean()
            print(f"Attempt {i+1}: Raw baseline = {baseline}")
            if baseline is not None and baseline is not False:
                return baseline
        except statistics.StatisticsError:
            print(f"Attempt {i+1}: Not enough data for mean.")
        time.sleep(delay)
    return None

def rotate_stepper(steps=STEP_COUNT, delay=STEP_DELAY):
    for _ in range(steps):
        for halfstep in STEPPER_SEQUENCE:
            for pin, val in zip([IN1, IN2, IN3, IN4], halfstep):
                GPIO.output(pin, val)
            time.sleep(delay)

# ------------------ MAIN ------------------

baseline = get_baseline()

if baseline is None:
    print("Failed to read baseline. Exiting...")
    GPIO.cleanup()
    exit()

print(f"Baseline (tare): {baseline}")
print("Now place chicken on the scale...")

# ✅ Calibrated using 205g known weight
# Example: 205g gave adjusted value ~19340 → 19340 / 0.205 = 94390.24
conversion_ratio = 94390.24  # raw units per kg

try:
    while True:
        try:
            reading = hx.get_raw_data_mean()
            if reading is not None and reading is not False:
                adjusted = reading - baseline
                weight_kg = adjusted / conversion_ratio
                print(f"Weight: {weight_kg:.3f} kg")

                if weight_kg >= WEIGHT_THRESHOLD_KG:
                    print("Threshold reached. Activating stepper motor...")
                    rotate_stepper()
                    time.sleep(5)  # Delay to avoid repeated activation
            else:
                print("HX711: No valid reading.")
        except statistics.StatisticsError:
            print("HX711: Insufficient valid data.")

        time.sleep(1)

except KeyboardInterrupt:
    print("\nInterrupted. Cleaning up...")
    GPIO.cleanup()

