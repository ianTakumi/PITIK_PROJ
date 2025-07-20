#include "HX711.h"

// HX711 circuit wiring
#define DT 4   // HX711 data pin (DOUT)
#define SCK 5  // HX711 clock pin (SCK)

HX711 scale;

// Start with a rough calibration factor; will need tuning
float calibration_factor = -500.0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Initializing HX711...");
  scale.begin(DT, SCK);
  scale.set_scale(calibration_factor);  // Apply initial calibration
  scale.tare();                         // Reset scale to 0

  Serial.println("Place known 205g weight (your phone)...");
  delay(3000); // Wait for user to place the weight
}

void loop() {
  if (scale.is_ready()) {
    float weight = scale.get_units(5);  // Get average of 5 readings
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" g");
  } else {
    Serial.println("HX711 not connected.");
  }

  delay(500);
}
