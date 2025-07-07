#!/usr/bin/python3
from hx711 import HX711
import RPi.GPIO as GPIO  # missing import
import time

try:
    hx711 = HX711(
        dout_pin=17,
        pd_sck_pin=21,
        channel='A',
        gain=64
    )

    measures = hx711.get_raw_data(times=3)

    # Print each reading
    for val in measures:
        print(f"Raw reading: {val}")

finally:
    GPIO.cleanup()  # always do GPIO cleanup!
