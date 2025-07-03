import serial
import time

# Set serial port to UART (GPIO14 & GPIO15)
# Usually /dev/serial0 or /dev/ttyAMA0 on Pi
ser = serial.Serial('/dev/serial0', baudrate=9600, timeout=1)

def send_at(command, delay=1):
    print(f"Sending command: {command}")
    ser.write((command + '\r\n').encode())
    time.sleep(delay)
    response = ser.read_all().decode()
    print(f"Response: {response}")
    return response

# Initialize and test
print("Testing SIM800C module...")

send_at("AT")               # Basic AT command
send_at("AT+CSQ")           # Signal quality
send_at("AT+CREG?")         # Network registration status
send_at("AT+CCID")          # SIM card number
send_at("AT+CMGF=1")        # Set SMS text mode
send_at('AT+CMGS="+639613886156"', delay=2)  # Recipient phone number
ser.write(b"Hello from Raspberry Pi!\x1A")   # End with Ctrl+Z

# Close serial after done
ser.close()
