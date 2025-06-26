import RPi.GPIO as GPIO
import time

# Setup
IR_PIN = 17      # GPIO pin connected to IR sensor output
SERVO_PIN = 18   # GPIO pin connected to Servo motor

GPIO.setmode(GPIO.BCM)
GPIO.setup(IR_PIN, GPIO.IN)
GPIO.setup(SERVO_PIN, GPIO.OUT)

# Setup PWM for Servo
pwm = GPIO.PWM(SERVO_PIN, 50)  # 50 Hz
pwm.start(0)

# Servo helper function
def set_angle(angle):
    duty = angle / 18 + 2
    GPIO.output(SERVO_PIN, True)
    pwm.ChangeDutyCycle(duty)
    time.sleep(0.5)
    GPIO.output(SERVO_PIN, False)
    pwm.ChangeDutyCycle(0)

try:
    print("Starting IR + Servo Control. Press CTRL+C to stop.")
    while True:
        if GPIO.input(IR_PIN) == 0:  # Beam broken / Object detected
            print("Object Detected! Rotating servo.")
            set_angle(90)
            time.sleep(1)
            set_angle(0)
        else:
            print("No object.")
        time.sleep(0.2)

except KeyboardInterrupt:
    print("\nStopping program.")

finally:
    pwm.stop()
    GPIO.cleanup()