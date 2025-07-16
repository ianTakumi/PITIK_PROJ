#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "SKYW_5F70_5G";
const char* password = "9H56bKXv";

// API endpoint
const char* serverName = "http://192.168.1.20/sensors";

// IR beam sensor pin
#define SENSOR_PIN 2  // Adjust as needed

String lastStatus = "";

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected!");
}

void loop() {
  int beamStatus = digitalRead(SENSOR_PIN);
  String currentStatus;

  if (beamStatus == LOW) {
    currentStatus = "occupied";  // IR beam broken → manok nasa shower
  } else {
    currentStatus = "vacant";    // beam clear → wala sa shower
  }

  // Only send update if changed
  if (currentStatus != lastStatus) {
    Serial.print("Shower status: ");
    Serial.println(currentStatus);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");

      // Updated type to "chicken_shower"
      String payload = "{\"type\":\"chicken_shower\", \"value\":\"" + currentStatus + "\"}";
      int httpResponseCode = http.POST(payload);

      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);

      http.end();
    } else {
      Serial.println("WiFi Disconnected");
    }

    lastStatus = currentStatus;
  }

  delay(500); // check every 0.5 seconds
}
