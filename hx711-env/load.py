import RPi.GPIO as GPIO
from hx711 import HX711
import time
import statistics

SCK = 5
DT = 6

GPIO.setmode(GPIO.BCM)

hx = HX711(dout_pin=DT, pd_sck_pin=SCK)

# Function to get baseline safely
def get_baseline(retries=5, delay=0.5):
    print("Reading baseline... Remove all weight.")
    time.sleep(2)

    for i in range(retries):
        try:
            baseline = hx.get_raw_data_mean()
            print(f"Attempt {i+1}: Raw baseline = {baseline}")
            if baseline is not None and baseline is not False:
                return baseline
        except statistics.StatisticsError as e:
            print(f"Attempt {i+1}: Not enough data to calculate mean (StatisticsError)")
        time.sleep(delay)

    return None

baseline = get_baseline()

if baseline is None:
    print("Failed to read from HX711 after retries.")
    GPIO.cleanup()
    exit()

print(f"Baseline (tare) value: {baseline}")
print("Now place weight on the load cell.")

try:
    while True:
        try:
            reading = hx.get_raw_data_mean()
            if reading is not None and reading is not False:
                weight = reading - baseline
                print(f"Adjusted reading: {weight}")
            else:
                print("Error reading data.")
        except statistics.StatisticsError:
            print("Error: Not enough valid data points from HX711.")
        time.sleep(1)

except KeyboardInterrupt:
    print("\nExiting. Cleaning up GPIO.")
    GPIO.cleanup()
