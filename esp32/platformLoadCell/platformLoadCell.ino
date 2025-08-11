#include "HX711.h"

#define DT 18   // HX711 data pin (DOUT)
#define SCK 19  // HX711 clock pin (SCK)

HX711 scale;

// Start with your computed factor (adjust in Serial Monitor)
float calibration_factor = 13924.39;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Initializing HX711...");
  scale.begin(DT, SCK);

  Serial.println("Taring... REMOVE all weight.");
  delay(3000);
  scale.tare();  // Zero point

  scale.set_scale(calibration_factor);

  Serial.println("Place known weight and adjust calibration factor with '+' or '-'.");
  Serial.println("----------------------------------------------------------");
}

void loop() {
  // Adjust calibration factor live
  if (Serial.available()) {
    char input = Serial.read();
    if (input == '+') calibration_factor += 10;
    else if (input == '-') calibration_factor -= 10;

    scale.set_scale(calibration_factor);

    Serial.print("New calibration factor: ");
    Serial.println(calibration_factor);
  }

  if (scale.is_ready()) {
    long raw = scale.read_average(10);   // Average raw ADC readings
    float weight = scale.get_units(10);  // Convert to grams

    // Ignore spikes (like saturation values)
    if (abs(raw) < 4000000) {
      Serial.print("Raw: ");
      Serial.print(raw);
      Serial.print(" | Weight: ");
      Serial.print(weight, 2);
      Serial.print(" g | Cal Factor: ");
      Serial.println(calibration_factor);
    } else {
      Serial.println("⚠ Spike detected, ignoring reading...");
    }

  } else {
    Serial.println("HX711 not connected.");
  }

  delay(500);
}
