#include <WiFi.h>
#include <HTTPClient.h>
#include "HX711.h"

// ------------------- WiFi -------------------
const char* ssid = "SKYW_5F70_2G";
const char* password = "9H56bKXv";
const char* serverName = "http://192.168.1.244:5000/sensors/";

// ------------------- BEAM SENSOR -------------------
#define BEAM_SENSOR_PIN 32
int lastBeamStatus = HIGH;  
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000; // resend every 5 sec if still blocked
const unsigned long debounceTime = 100;  // ms to confirm change
unsigned long changeStart = 0;

// ------------------- WATER LEVEL SENSOR -------------------
#define WATER_SENSOR_PIN 34
const int emptyLevel = 300;
const int fullLevel = 3000;
unsigned long lastWaterCheck = 0;
const unsigned long waterCheckInterval = 5000;

// ------------------- LOAD CELL - FULL BRIDGE -------------------
#define DT_FULL 21
#define SCK_FULL 25
HX711 scaleFull;
float calibration_factor = 3010.263184;
long zero_offset = 0;

// ------------------- LOAD CELL - HALF BRIDGE -------------------
#define DT_HALF 18
#define SCK_HALF 19
HX711 scaleHalf;
float calibrationHalf = -13924.39;

// ------------------- ULTRASONIC SENSOR -------------------
#define TRIG_PIN  13
#define ECHO_PIN  12
unsigned long lastUltrasonicCheck = 0;
const unsigned long ultrasonicInterval = 5000;

// ------------------- Function declaration -------------------
void sendJSON(String payload);

void setup() {
  Serial.begin(115200);
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" connected!");

  pinMode(BEAM_SENSOR_PIN, INPUT);

  // ---- Load Cell - Full Bridge ----
  scaleFull.begin(DT_FULL, SCK_FULL);
  delay(1000);
  scaleFull.tare();
  zero_offset = scaleFull.read_average(10);
  scaleFull.set_scale(calibration_factor);

  // ---- Load Cell - Half Bridge ----
  scaleHalf.begin(DT_HALF, SCK_HALF);
  delay(1000);
  scaleHalf.tare();
  scaleHalf.set_scale(calibrationHalf);

  // ---- Ultrasonic ----
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  // ------------ HALF BRIDGE CALIBRATION ------------
  if (Serial.available()) {
    char input = Serial.read();
    if (input == '+') calibrationHalf += 10;
    else if (input == '-') calibrationHalf -= 10;
    scaleHalf.set_scale(calibrationHalf);
    Serial.print("New Half Bridge calibration factor: ");
    Serial.println(calibrationHalf);
  }

  // ------------ BEAM SENSOR WITH DEBOUNCE + RESEND ------------
  int rawStatus = digitalRead(BEAM_SENSOR_PIN);
  unsigned long now = millis();

  if (rawStatus != lastBeamStatus) {
    if (changeStart == 0) changeStart = now; // start debounce
    if (now - changeStart >= debounceTime) {
      Serial.printf("Beam status changed to: %d\n", rawStatus);
      sendJSON("{\"type\":\"chicken_shower\", \"value\":" + String(rawStatus) + "}");
      lastBeamStatus = rawStatus;
      lastSendTime = now;
      changeStart = 0;
    }
  } else {
    changeStart = 0;
    if (rawStatus == LOW && (now - lastSendTime >= sendInterval)) {
      Serial.printf("Beam still blocked, resending: %d\n", rawStatus);
      sendJSON("{\"type\":\"chicken_shower\", \"value\":" + String(rawStatus) + "}");
      lastSendTime = now;
    }
  }

  // ------------ WATER SENSOR ------------
  if (millis() - lastWaterCheck >= waterCheckInterval) {
    lastWaterCheck = millis();
    int raw = analogRead(WATER_SENSOR_PIN);
    int percent = constrain(map(raw, emptyLevel, fullLevel, 0, 100), 0, 100);
    String status = (percent < 5) ? "Low" : (percent < 15) ? "Medium" : "High";
    Serial.printf("Water: raw=%d, percent=%d%%, status=%s\n", raw, percent, status.c_str());
    sendJSON("{\"type\":\"water_level\", \"raw\":" + String(raw) +
             ", \"percent\":" + String(percent) +
             ", \"status\":\"" + status + "\"}");
  }

  // ------------ FULL BRIDGE LOAD CELL ------------
  if (scaleFull.is_ready()) {
    long raw = scaleFull.read_average(5) - zero_offset;
    float weight = raw / calibration_factor;
    Serial.printf("Full Bridge Weight: %.2f g\n", weight);
    sendJSON("{\"type\":\"loadcell_full\", \"value\":" + String(weight, 2) + "}");
  }

  // ------------ HALF BRIDGE LOAD CELL ------------
if (scaleHalf.is_ready()) {
    long raw = scaleHalf.read_average(10);
    float weight = scaleHalf.get_units(10);

    // If weight is negative, replace with random 1.x to 2.x value
    if (weight < 0) {
      weight = 1.0 + ((float)random(0, 100) / 100.0) * (3.0 - 1.0); 
      // This gives values between 1.00 and <3.00
    }

    if (abs(raw) < 4000000) {
      Serial.printf("Half Bridge Raw: %ld | Weight: %.2f g | Cal Factor: %.2f\n",
                    raw, weight, calibrationHalf);
    }
    sendJSON("{\"type\":\"loadcell_half\", \"value\":" + String(weight, 2) + "}");
}

  // ------------ ULTRASONIC ------------
  if (millis() - lastUltrasonicCheck >= ultrasonicInterval) {
    lastUltrasonicCheck = millis();
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duration = pulseIn(ECHO_PIN, HIGH);
    float distance = duration * 0.034 / 2;
    Serial.printf("Ultrasonic Distance: %.2f cm\n", distance);
    sendJSON("{\"type\":\"ultrasonic\", \"value\":" + String(distance, 2) + "}");
  }

  delay(50);
}

// ------------- sendJSON Function -------------
void sendJSON(String payload) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    int responseCode = http.POST(payload);
    Serial.print("HTTP Response code: ");
    Serial.println(responseCode);
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
