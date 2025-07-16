#include <WiFi.h>
#include <HTTPClient.h>

// WiFi credentials
const char* ssid = "SKYFiber_2.4GHz_JqP9";
const char* password = "GJ7bqTqe";

// API endpoint
const char* serverName = "http://192.168.100.20:5000/sensors/";

// Ultrasonic sensor pins
const int trigPin = 5;
const int echoPin = 18;

void setup() {
  Serial.begin(115200);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected!");
}

void loop() {
  long duration;
  float distance;

  // Trigger ultrasonic pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read echo duration
  duration = pulseIn(echoPin, HIGH);

  // Convert to distance in cm
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Send JSON payload via HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"type\":\"ultrasonic\", \"value\":" + String(distance, 2) + "}";

    int httpResponseCode = http.POST(payload);

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  delay(5000);  // Send every 5 seconds
}
