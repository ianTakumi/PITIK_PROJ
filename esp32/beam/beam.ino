#include <WiFi.h>
#include <HTTPClient.h>

#define SENSOR_PIN 32

// WiFi credentials
const char* ssid = "SKYW_5F70_2G";
const char* password = "9H56bKXv";

// API endpoint
const char* serverName = "http://192.168.1.244:5000/sensors/";

int lastBeamStatus = HIGH;  
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000; // resend every 5 sec if still blocked
const unsigned long debounceTime = 100;  // milliseconds required to confirm change
unsigned long changeStart = 0;

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected!");
}

void loop() {
  int rawStatus = digitalRead(SENSOR_PIN);
  unsigned long now = millis();

  // Detect possible change
  if (rawStatus != lastBeamStatus) {
    // Start debounce timer
    if (changeStart == 0) {
      changeStart = now;
    }
    // If stable long enough, confirm change
    if (now - changeStart >= debounceTime) {
      Serial.printf("Beam status changed to: %d\n", rawStatus);
      sendBeamStatus(rawStatus);
      lastBeamStatus = rawStatus;
      lastSendTime = now;
      changeStart = 0; // reset
    }
  } else {
    changeStart = 0; // reset if same reading
    // Resend if still blocked after interval
    if (rawStatus == LOW && (now - lastSendTime >= sendInterval)) {
      Serial.printf("Beam still blocked, resending: %d\n", rawStatus);
      sendBeamStatus(rawStatus);
      lastSendTime = now;
    }
  }

  delay(10); // small delay for CPU relief
}

void sendBeamStatus(int value) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    char payload[80];
    sprintf(payload, "{\"type\":\"chicken_shower\", \"value\":%d}", value);

    int httpResponseCode = http.POST((uint8_t*)payload, strlen(payload));

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
