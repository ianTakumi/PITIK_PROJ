from picamera2 import Picamera2
import time

# Initialize camera
camera = Picamera2()
camera.preview_configuration.main.size = (640, 480)
camera.preview_configuration.main.format = "RGB888"
camera.configure("preview")

# Start camera
camera.start()
print("Camera warming up...")
time.sleep(2)

# Capture image
camera.capture_file("/home/pi/Desktop/test_image.jpg")
print("Image saved as test_image.jpg")

camera.stop()
