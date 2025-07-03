import time
from hx711 import HX711
import RPi.GPIO as GPIO

# === Setup for HX711 ===
hx = HX711(dout_pin=5, pd_sck_pin=6)
hx.zero()
print("Taring... Please remove any weight.")
time.sleep(2)
print("Ready. Place weight now.")

# === Setup for Stepper Motor ===
IN1 = 17
IN2 = 18
IN3 = 27
IN4 = 22

control_pins = [IN1, IN2, IN3, IN4]

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

for pin in control_pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, 0)

# Half-step sequence for 28BYJ-48
halfstep_seq = [
    [1,0,0,0],
    [1,1,0,0],
    [0,1,0,0],
    [0,1,1,0],
    [0,0,1,0],
    [0,0,1,1],
    [0,0,0,1],
    [1,0,0,1]
]

# Function to rotate stepper
def rotate_stepper(steps=512, delay=0.001):
    for _ in range(steps):
        for step in halfstep_seq:
            for pin in range(4):
                GPIO.output(control_pins[pin], step[pin])
            time.sleep(delay)

# === Main loop ===
try:
    while True:
        raw_weight = hx.get_weight_mean(5)
        print(f"Weight: {raw_weight:.2f}")

        # Adjust this threshold as needed (based on your calibration)
        if raw_weight > 10000:  # Example threshold (raw units, not grams yet)
            print("Weight threshold exceeded! Rotating motor...")
            rotate_stepper()
        time.sleep(1)

except KeyboardInterrupt:
    print("Exiting...")

finally:
    hx.shutdown()
    GPIO.cleanup()