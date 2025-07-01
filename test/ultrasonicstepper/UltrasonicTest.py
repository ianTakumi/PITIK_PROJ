import RPi.GPIO as GPIO
import time

# Pin configuration
TRIG = 23
ECHO = 24

# Setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)

def get_distance():
    # Send 10us pulse to trigger
    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)

    # Wait for echo to go HIGH
    start = time.time()
    while GPIO.input(ECHO) == 0:
        start = time.time()

    # Wait for echo to go LOW
    stop = time.time()
    while GPIO.input(ECHO) == 1:
        stop = time.time()

    # Calculate time difference
    elapsed = stop - start
    distance = (elapsed * 34300) / 2  # cm

    return round(distance, 2)

try:
    while True:
        dist = get_distance()
        print(f"? Distance: {dist} cm")
        time.sleep(1)

except KeyboardInterrupt:
    print("? Measurement stopped by user")
    GPIO.cleanup()
        