#include "HX711.h"

// HX711 circuit wiring
#define DT 4   // HX711 data pin (DOUT)
#define SCK 5  // HX711 clock pin (SCK)

HX711 scale;

float calibration_factor = -7050.0;  // Adjust this based on your calibration

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Initializing HX711...");
  scale.begin(DT, SCK);
  scale.set_scale(calibration_factor);  // Apply calibration factor
  scale.tare();                         // Reset the scale to 0

  Serial.println("Place weight to measure...");
}

void loop() {
  if (scale.is_ready()) {
    float weight = scale.get_units(5);  // Get average of 5 readings
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" g");  // Change to "kg" if needed
  } else {
    Serial.println("HX711 not connected.");
  }

  delay(500);  // Adjust reading interval
}
