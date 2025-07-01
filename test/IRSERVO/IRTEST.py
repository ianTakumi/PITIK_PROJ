import RPi.GPIO as GPIO
import time

IR_PIN = 17  # GPIO pin kung saan nakakabit ang IR receiver

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(IR_PIN, GPIO.IN)

def loop():
    print("Naghihintay ng IR signal...")
    while True:
        if GPIO.input(IR_PIN) == 0:
            print("IR signal na-detect!")
            time.sleep(0.5)  # debounce delay

def destroy():
    GPIO.cleanup()

if __name__ == '__main__':
    try:
        setup()
        loop()
    except KeyboardInterrupt:
        print("Manual stop by user")
        destroy()

