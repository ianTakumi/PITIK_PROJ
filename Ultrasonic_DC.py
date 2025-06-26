import RPi.GPIO as GPIO
import time

# Pin configuration
TRIG = 23
ECHO = 24
RELAY = 17
MOTOR = 27

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)
GPIO.setup(RELAY, GPIO.OUT)
GPIO.setup(MOTOR, GPIO.OUT)

# Initialize output pins
GPIO.output(RELAY, GPIO.LOW)
GPIO.output(MOTOR, GPIO.LOW)

def measure_distance():
    # Send 10us pulse to trigger
    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)

    # Wait for echo start
    while GPIO.input(ECHO) == 0:
        pulse_start = time.time()

    # Wait for echo end
    while GPIO.input(ECHO) == 1:
        pulse_end = time.time()

    # Calculate pulse duration
    pulse_duration = pulse_end - pulse_start

    # Distance (cm) = pulse duration * 17150
    distance = pulse_duration * 17150
    distance = round(distance, 2)
    return distance

try:
    while True:
        dist = measure_distance()
        print(f"Distance: {dist} cm")

        if dist < 20:
            print("Object detected - Turning ON relay and motor")
            GPIO.output(RELAY, GPIO.HIGH)
            GPIO.output(MOTOR, GPIO.HIGH)
        else:
            print("No object - Turning OFF relay and motor")
            GPIO.output(RELAY, GPIO.LOW)
            GPIO.output(MOTOR, GPIO.LOW)

        time.sleep(0.5)

except KeyboardInterrupt:
    print("Program stopped by User")
    GPIO.cleanup()