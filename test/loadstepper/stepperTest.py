import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
pins = [17, 18, 27, 22]

for pin in pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, 0)

sequence = [
    [1,0,0,0],
    [0,1,0,0],
    [0,0,1,0],
    [0,0,0,1]
]

try:
    while True:
        for step in sequence:
            for pin in range(4):
                GPIO.output(pins[pin], step[pin])
            time.sleep(0.01)  # slower step to watch movement

except KeyboardInterrupt:
    GPIO.cleanup()
