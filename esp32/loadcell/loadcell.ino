#include "HX711.h"

#define DT  21
#define SCK 25

HX711 scale;

  float calibration_factor = 3010.263184; // mula sa calibration
  long zero_offset = 0;

void setup() {
  Serial.begin(115200);
  scale.begin(DT, SCK);
  delay(1000);

  Serial.println("Remove all weight from scale...");
  delay(3000);

  scale.tare(); // zero the scale
  zero_offset = scale.read_average(10); // kunin ang raw zero
  Serial.print("Zero offset: ");    
  Serial.println(zero_offset);

  scale.set_scale(calibration_factor);
  Serial.println("Place weight to test...");
}

void loop() {
  if (scale.is_ready()) {
    long raw = scale.read_average(5) - zero_offset; // tanggalin offset
    float weight = raw / calibration_factor; // convert to grams
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" g");
  } else {
    Serial.println("HX711 not connected.");
  }
  delay(500);
}
