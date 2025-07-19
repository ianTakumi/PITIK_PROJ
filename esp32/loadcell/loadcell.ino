#include <WiFi.h>
#include <HTTPClient.h>
#include "HX711.h"

// WiFi credentials
const char* ssid = "SKYW_5F70_2G";
const char* password = "9H56bKXv";

// API endpoint
const char* serverName = "http://192.168.1.245:5000/sensors/";

// HX711 pins
#define DT  4    // HX711 DOUT
#define SCK 5    // HX711 SCK

// HX711 object
HX711 scale;
float calibration_factor = -7050;  // Adjust this after calibration
float threshold = 50.0;            // Trigger weight in grams
bool triggered = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected!");

  // Initialize HX711
  Serial.println("Initializing HX711...");
  scale.begin(DT, SCK);
  scale.set_scale(calibration_factor);
  scale.tare();  // Set current weight as 0
  Serial.println("Scale ready.");
}

void loop() {
  if (scale.is_ready()) {
    float weight = scale.get_units(5);  // Average of 5 readings
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" g");

    if (!triggered && weight > threshold) {
      Serial.println("Chicken detected on scale.");
      sendDetection(weight);
      triggered = true;
    } else if (triggered && weight <= threshold) {
      Serial.println("Chicken left the scale.");
      sendDetection(weight);
      triggered = false;
    }

  } else {
    Serial.println("HX711 not found.");
  }

  delay(500);  // Loop delay
}

void sendDetection(float weight) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Format payload with actual weight
    String payload = "{\"type\":\"loadcell\", \"value\":" + String(weight, 2) + "}";

    int httpResponseCode = http.POST(payload);

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
