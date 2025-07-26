#include <WiFi.h>
#include <HTTPClient.h>
#include "HX711.h"

// WiFi credentials
const char* ssid = "SKYW_5F70_2G";
const char* password = "9H56bKXv";

// API endpoint
const char* serverName = "http://192.168.1.244:5000/sensors/";

// ------------------- BEAM SENSOR -------------------
#define BEAM_SENSOR_PIN 32
static bool isOccupied = false;
static bool beamPreviouslyBroken = false;

// ------------------- WATER LEVEL SENSOR -------------------
#define WATER_SENSOR_PIN 34
const int emptyLevel = 300;
const int fullLevel = 3000;
unsigned long lastWaterCheck = 0;
const unsigned long waterCheckInterval = 5000;

// ------------------- LOAD CELL - FULL BRIDGE -------------------
#define DT_FULL 4
#define SCK_FULL 5
HX711 scaleFull;
float calibrationFull = -7050.0;
float thresholdFull = 50.0;
bool triggeredFull = false;

// ------------------- LOAD CELL - HALF BRIDGE -------------------
#define DT_HALF 18
#define SCK_HALF 19
HX711 scaleHalf;
float calibrationHalf = -3500.0;
bool triggeredHalf = false;

// ------------------- ULTRASONIC SENSOR -------------------
#define TRIG_PIN  13
#define ECHO_PIN  12
unsigned long lastUltrasonicCheck = 0;
const unsigned long ultrasonicInterval = 5000;

// Function declaration
void sendJSON(String payload);

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

  // Beam Sensor
  pinMode(BEAM_SENSOR_PIN, INPUT);

  // Load Cell - Full Bridge
  Serial.println("Initializing Full Bridge HX711...");
  scaleFull.begin(DT_FULL, SCK_FULL);
  scaleFull.set_scale(calibrationFull);
  scaleFull.tare();

  // Load Cell - Half Bridge
  Serial.println("Initializing Half Bridge HX711...");
  scaleHalf.begin(DT_HALF, SCK_HALF);
  scaleHalf.set_scale(calibrationHalf);
  scaleHalf.tare();

  // Ultrasonic
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  // ------------ BEAM SENSOR ------------
  int beamState = digitalRead(BEAM_SENSOR_PIN); // 1 = beam broken, 0 = clear

  if (beamState == 1 && !beamPreviouslyBroken) {
    beamPreviouslyBroken = true;

    if (!isOccupied) {
      Serial.println("Chicken entered (beam broken)");
      isOccupied = true;

      sendJSON("{\"type\":\"chicken_shower\", \"value\":\"detected\"}");
    } else {
      Serial.println("Chicken exited (beam broken again)");
      isOccupied = false;

      sendJSON("{\"type\":\"chicken_shower\", \"value\":\"clear\"}");
    }
  }

  if (beamState == 0 && beamPreviouslyBroken) {
    beamPreviouslyBroken = false;
  }

  // ------------ WATER SENSOR ------------
  if (millis() - lastWaterCheck >= waterCheckInterval) {
    lastWaterCheck = millis();
    int raw = analogRead(WATER_SENSOR_PIN);
    int percent = constrain(map(raw, emptyLevel, fullLevel, 0, 100), 0, 100);
    String status = (percent < 5) ? "Low" : (percent < 15) ? "Medium" : "High";

    Serial.printf("Water: raw=%d, percent=%d%%, status=%s\n", raw, percent, status.c_str());

    String json = "{\"type\":\"water_level\", \"raw\":" + String(raw) +
                  ", \"percent\":" + String(percent) +
                  ", \"status\":\"" + status + "\"}";
    sendJSON(json);
  }

  // ------------ LOAD CELL - FULL BRIDGE ------------
  if (scaleFull.is_ready()) {
    float weight = scaleFull.get_units(5);
    Serial.printf("Full Bridge Weight: %.2f g\n", weight);
    if (!triggeredFull && weight > thresholdFull) {
      sendJSON("{\"type\":\"loadcell_full\", \"value\":" + String(weight, 2) + "}");
      triggeredFull = true;
    } else if (triggeredFull && weight <= thresholdFull) {
      sendJSON("{\"type\":\"loadcell_full\", \"value\":" + String(weight, 2) + "}");
      triggeredFull = false;
    }
  } else {
    Serial.println("HX711 Full Bridge not connected.");
  }

  // ------------ LOAD CELL - HALF BRIDGE ------------
  if (scaleHalf.is_ready()) {
    float weight = scaleHalf.get_units(5);
    Serial.printf("Half Bridge Weight: %.2f g\n", weight);
    if (!triggeredHalf && weight > 20.0) {
      sendJSON("{\"type\":\"loadcell_half\", \"value\":" + String(weight, 2) + "}");
      triggeredHalf = true;
    } else if (triggeredHalf && weight <= 20.0) {
      sendJSON("{\"type\":\"loadcell_half\", \"value\":" + String(weight, 2) + "}");
      triggeredHalf = false;
    }
  } else {
    Serial.println("HX711 Half Bridge not connected.");
  }

  // ------------ ULTRASONIC SENSOR ------------
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

    String json = "{\"type\":\"ultrasonic\", \"value\":" + String(distance, 2) + "}";
    sendJSON(json);
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
