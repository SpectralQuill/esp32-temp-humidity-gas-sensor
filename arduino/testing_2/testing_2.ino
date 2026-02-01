// ESP32 Analog Pin 35 Reader
// Simple script to read and print analog value from pin 35

void setup() {
  Serial.begin(115200);
  pinMode(35, INPUT);
  
  // Wait for serial connection (optional)
  while (!Serial) {
    delay(10);
  }
  
  Serial.println("ESP32 Pin 35 Analog Reader Started");
  Serial.println("Format: RawAnalogValue");
}

void loop() {
  // Read analog pin 35
  int analogValue = analogRead(35);
  
  // Print raw value only
  Serial.println(analogValue);
  
  // Delay for stability (adjust as needed)
  delay(100);
}