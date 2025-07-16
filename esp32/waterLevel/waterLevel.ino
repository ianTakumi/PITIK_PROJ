#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "SKYFiber_2.4GHz_JqP9";
const char* password = "GJ7bqTqe";

// API endpoint
const char* serverName = "http://192.168.100.20:5000/sensors/";

// Capacitive water level sensor connected to analog pin
const int sensorPin = 34; // GPIO 34 is analog-only on ESP32

// Calibration values (adjust based on real measurements)
const int emptyLevel = 300;   // Raw ADC when sensor is dry
const int fullLevel = 3000;   // Raw ADC when sensor is fully submerged

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected!");
}

void loop() {
  // Read raw ADC value from sensor
  int waterLevelRaw = analogRead(sensorPin);

  // Convert raw value to percentage
  int waterLevelPercent = map(waterLevelRaw, emptyLevel, fullLevel, 0, 100);
  waterLevelPercent = constrain(waterLevelPercent, 0, 100);

  // Determine water level status
  String status;
  if (waterLevelPercent < 25) {
    status = "Low";
  } else if (waterLevelPercent < 75) {
    status = "Medium";
  } else {
    status = "High";
  }

  // Print values for debugging
  Serial.print("Water Level (raw ADC): ");
  Serial.print(waterLevelRaw);
  Serial.print(" | Percent: ");
  Serial.print(waterLevelPercent);
  Serial.print("% | Status: ");
  Serial.println(status);

  // Send data to API
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Create JSON payload
    String payload = "{\"type\":\"water_level\", \"raw\":" + String(waterLevelRaw) +
                     ", \"percent\":" + String(waterLevelPercent) +
                     ", \"status\":\"" + status + "\"}";

    int httpResponseCode = http.POST(payload);

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  delay(5000); // Wait 5 seconds before next reading
}
