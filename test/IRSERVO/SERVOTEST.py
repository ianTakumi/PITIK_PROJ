import RPi.GPIO as GPIO
import time

SERVO_PIN = 18  # Use GPIO18 (Pin 12)

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(SERVO_PIN, GPIO.OUT)
    pwm = GPIO.PWM(SERVO_PIN, 50)  # 50Hz for servo
    pwm.start(0)
    return pwm

def set_angle(pwm, angle):
    duty = 2 + (angle / 18)
    pwm.ChangeDutyCycle(duty)
    time.sleep(0.5)

def cleanup(pwm):
    pwm.stop()
    GPIO.cleanup()

if __name__ == "__main__":
    try:
        pwm = setup()
        while True:
            # Sweep from 0 to 180 degrees
            for angle in range(0, 181, 30):
                set_angle(pwm, angle)
            # Then sweep back from 180 to 0 degrees
            for angle in range(180, -1, -30):
                set_angle(pwm, angle)
    except KeyboardInterrupt:
        print("Stopped by user.")
    finally:
        cleanup(pwm)
daw