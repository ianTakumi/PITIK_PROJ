#include "HX711.h"

// HX711 pins
#define DT  4    // HX711 DOUT
#define SCK 5    // HX711 SCK

HX711 scale;

float calibration_factor = -7050;  // Adjust this based on your own calibration
float threshold = 50.0;            // Trigger weight in grams
bool triggered = false;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Initializing HX711...");
  scale.begin(DT, SCK);
  delay(500);  // Let the HX711 stabilize

  if (scale.is_ready()) {
    Serial.println("HX711 ready.");
    scale.set_scale(calibration_factor);  // Set calibration factor
    scale.tare();                         // Set current reading as 0
    Serial.println("Tared. Ready to weigh.");
  } else {
    Serial.println("HX711 not found. Check wiring.");
  }
}

void loop() {
  if (scale.is_ready()) {
    float weight = scale.get_units(5);  // Average of 5 readings
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" g");

    if (!triggered && weight > threshold) {
      Serial.println("Object detected on scale.");
      triggered = true;
    } else if (triggered && weight <= threshold) {
      Serial.println("Object removed from scale.");
      triggered = false;
    }

  } else {
    Serial.println("Waiting for HX711...");
  }

  delay(500);
}
