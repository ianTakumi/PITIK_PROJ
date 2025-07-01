import RPi.GPIO as GPIO
import time

# Use BCM GPIO references
GPIO.setmode(GPIO.BCM)

# Define GPIO pins
control_pins = [17, 18, 27, 22]

# Set pins as output
for pin in control_pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, 0)

# Step sequence for 28BYJ-48
halfstep_seq = [
    [1,0,0,1],
    [1,0,0,0],
    [1,1,0,0],
    [0,1,0,0],
    [0,1,1,0],
    [0,0,1,0],
    [0,0,1,1],
    [0,0,0,1]
]

try:
    print("Running stepper motor...")
    for i in range(512):  # approx 1 full revolution
        for halfstep in range(8):
            for pin in range(4):
                GPIO.output(control_pins[pin], halfstep_seq[halfstep][pin])
            time.sleep(0.001)
    print("Done.")
finally:
    GPIO.cleanup()
