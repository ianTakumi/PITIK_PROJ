import subprocess

# Take a picture using libcamera
output_file = "test_output.jpg"
print("📸 Capturing image...")
result = subprocess.run(["libcamera-still", "-o", output_file], capture_output=True)

if result.returncode == 0:
    print(f"✅ Image saved as {output_file}")
else:
    print("❌ Failed to capture image.")
    print(result.stderr.decode())
