#include <LiquidCrystal.h>

const int rs = 2, en = 3, d4 = 4, d5 = 5, d6 = 6, d7 = 7;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

int currentPin = 0;

void setup() {
  Serial.begin(115200);
  lcd.begin(16, 2);
  lcd.print("Press to change");
  lcd.setCursor(0, 1);
  lcd.print("pin for testing");
  delay(2000);
}

void loop() {
  // Skip pins 2-9 and 23
  // while ((currentPin >= 1 && currentPin <= 13) || (currentPin >= 15 && currentPin <= 21) || (currentPin >= 23 && currentPin <= 29) || (currentPin >= 31 && currentPin <= 37) || (currentPin >= 39 && currentPin <= 40) || currentPin == 23) {
  //   currentPin++;
  //   if (currentPin > 40) currentPin = 0;
  // }
  
  int rawValue = analogRead(currentPin);
  float voltage = (rawValue * 3.3) / 4095.0;
  
  // Display on LCD
  lcd.clear();
  lcd.print("Pin ");
  lcd.print(currentPin);
  lcd.print(": ");
  lcd.print(rawValue);
  lcd.setCursor(0, 1);
  lcd.print(voltage, 3);
  lcd.print("V ");
  
  // Interpretation
  if (rawValue == 0) {
    lcd.print("(GND)");
  } else if (rawValue >= 4090) {
    lcd.print("(3.3V)");
  } else if (voltage > 0.2 && voltage < 0.5) {
    float temp = voltage * 100.0;
    lcd.print(temp, 1);
    lcd.print("C");
  }
  
  // Serial output
  Serial.print("Pin ");
  Serial.print(currentPin);
  Serial.print(": ");
  Serial.print(rawValue);
  Serial.print(" = ");
  Serial.print(voltage, 3);
  Serial.println("V");
  
  // Wait and move to next pin
  delay(000);
  currentPin++;
  if (currentPin > 40) currentPin = 0;
}