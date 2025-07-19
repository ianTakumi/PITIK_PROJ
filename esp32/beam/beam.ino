#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "SKYW_5F70_2G";
const char* password = "9H56bKXv";

// API endpoint
const char* serverName = "http://192.168.1.245:5000/sensors/";

// IR sensor pin
#define SENSOR_PIN 32

int lastBeamStatus = HIGH;  // assume beam is unbroken

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected!");
}

void loop() {
  int currentBeamStatus = digitalRead(SENSOR_PIN);

  if (currentBeamStatus != lastBeamStatus) {
    // Beam status changed → either enter or exit
    if (currentBeamStatus == LOW) {
      Serial.println("Chicken entered (beam broken)");
      sendDetection("detected");
    } else {
      Serial.println("Chicken exited (beam restored)");
      sendDetection("clear");
    }

    lastBeamStatus = currentBeamStatus;  // update state
  }

  delay(50);  // small delay for debounce
}

void sendDetection(String status) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"type\":\"chicken_shower\", \"value\":\"" + status + "\"}";
    int httpResponseCode = http.POST(payload);

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
