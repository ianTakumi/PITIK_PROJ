import RPi.GPIO as GPIO
import time

# Pin configuration
WATER_SENSOR_PIN = 17    # Input pin for water level sensor
RELAY_PIN = 27           # Output pin for relay control (pump)

# GPIO setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(WATER_SENSOR_PIN, GPIO.IN)
GPIO.setup(RELAY_PIN, GPIO.OUT)

# Initially turn off the relay
GPIO.output(RELAY_PIN, GPIO.HIGH)

def main():
    print("Water level monitoring started...")
    try:
        while True:
            water_detected = GPIO.input(WATER_SENSOR_PIN)

            if water_detected:
                print("💧 Water level is OK. Turning OFF pump.")
                GPIO.output(RELAY_PIN, GPIO.HIGH)  # Relay OFF
            else:
                print("⚠️ Low water level! Turning ON pump.")
                GPIO.output(RELAY_PIN, GPIO.LOW)   # Relay ON

            time.sleep(1)  # Check every second

    except KeyboardInterrupt:
        print("\nProgram stopped by user.")

    finally:
        GPIO.output(RELAY_PIN, GPIO.HIGH)  # Make sure pump is OFF
        GPIO.cleanup()

if _name_ == "_main_":
    main()