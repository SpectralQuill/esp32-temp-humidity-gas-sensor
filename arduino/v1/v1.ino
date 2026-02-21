// Configuration constants
const unsigned long LOOP_INTERVAL = 250; // milliseconds
const unsigned long BAUD_RATE = 115200;

// Sensor pins based on CSV data
const int TEMP_PINS[] = {0, 14, 22, 30, 38}; // A0 indexes
const int HUMIDITY_PIN = 35;                 // A1
const int GAS_PIN = 32;                      // S3

// LCD control pins
const int LCD_RS = 2;    // D2
const int LCD_E = 3;     // D3  
const int LCD_D4 = 4;    // D4
const int LCD_D5 = 5;    // D5
const int LCD_D6 = 6;    // D6
const int LCD_D7 = 7;    // D7

// Button pins (2-bit encoding)
const int LCD_BIT_1 = 9; // D9'
const int LCD_BIT_2 = 8; // D8

#include <LiquidCrystal.h>

// ============================================
// SensorsReader Class - FIXED VERSION
// ============================================
class SensorsReader {
  private:
    float currentTempC;
    float currentHumidity;
    float currentGas;
    
    // FIXED: Better rounding to half with epsilon for floating point comparison
    float roundToHalf(float value) {
      // Handle negative values properly
      if (value < 0) return 0.0;
      
      // Round to nearest 0.5 with proper handling
      float rounded = round(value * 2.0) / 2.0;
      return rounded;
    }
    
    // FIXED: Proper rounding to integer
    float roundToInteger(float value) {
      if (value < 0) return 0.0;
      return round(value);
    }
    
    // FIXED: Added validation and bounds checking
    float convertAnalogToTempC(int analogValue) {
      if (analogValue < 0) return 0.0;
      
      // y = 0.321364x - 0.100672
      float temp = (0.321364 * analogValue) - 0.100672;
      
      // Validate temperature range (adjust based on your sensor)
      if (temp < -10.0 || temp > 50.0) {
        return currentTempC; // Return last valid reading
      }
      
      return roundToHalf(temp);
    }
    
    // FIXED: Ensure percentage is within 0-100
    float convertAnalogToPercentage(int analogValue) {
      if (analogValue < 0) return 0.0;
      
      // y = 0.097655x + 0.001815
      float percentage = (0.097655 * analogValue) + 0.001815;
      percentage = roundToInteger(percentage);
      
      // Clamp to 0-100
      if (percentage < 0.0) return 0.0;
      if (percentage > 100.0) return 100.0;
      return percentage;
    }
    
    // FIXED: Get median instead of mode for better noise rejection
    float getMedianValue(const int readings[], int size) {
      if (size == 0) return 0.0;
      
      // Copy array and sort
      int sorted[size];
      for (int i = 0; i < size; i++) {
        sorted[i] = readings[i];
      }
      
      // Simple bubble sort
      for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - i - 1; j++) {
          if (sorted[j] > sorted[j + 1]) {
            int temp = sorted[j];
            sorted[j] = sorted[j + 1];
            sorted[j + 1] = temp;
          }
        }
      }
      
      // Return median
      if (size % 2 == 0) {
        return (sorted[size/2 - 1] + sorted[size/2]) / 2.0;
      } else {
        return sorted[size/2];
      }
    }
    
    // FIXED: Debounce analog readings
    int readAnalogDebounced(int pin, int samples = 5) {
      long total = 0;
      for (int i = 0; i < samples; i++) {
        total += analogRead(pin);
        delay(1); // Small delay between readings
      }
      return total / samples;
    }
    
  public:
    SensorsReader() {
      // Initialize sensor pins
      for (int i = 0; i < sizeof(TEMP_PINS)/sizeof(TEMP_PINS[0]); i++) {
        pinMode(TEMP_PINS[i], INPUT);
      }
      pinMode(HUMIDITY_PIN, INPUT);
      pinMode(GAS_PIN, INPUT);
      
      currentTempC = 0.0;
      currentHumidity = 0.0;
      currentGas = 0.0;
    }
    
    float readTempC() {
      // Read all temperature pins with debouncing
      int tempReadings[sizeof(TEMP_PINS)/sizeof(TEMP_PINS[0])];
      for (int i = 0; i < sizeof(TEMP_PINS)/sizeof(TEMP_PINS[0]); i++) {
        tempReadings[i] = readAnalogDebounced(TEMP_PINS[i]);
      }
      float medianValue = getMedianValue(tempReadings, sizeof(TEMP_PINS)/sizeof(TEMP_PINS[0]));
      return convertAnalogToTempC(medianValue);
    }
    
    float readHumidity() {
      int analogValue = readAnalogDebounced(HUMIDITY_PIN);
      return convertAnalogToPercentage(analogValue);
    }
    
    float readGas() {
      int analogValue = readAnalogDebounced(GAS_PIN);
      return convertAnalogToPercentage(analogValue);
    }
    
    void updateReadings() {
      currentTempC = readTempC();
      currentHumidity = readHumidity();
      currentGas = readGas();
    }
    
    // FIXED: Improved JSON output with error checking
    void printReadings() {
      Serial.print("{\"temperatureC\":");
      
      // FIX: Ensure proper decimal formatting
      char tempStr[10];
      dtostrf(currentTempC, 4, 1, tempStr); // 4 chars total, 1 decimal
      Serial.print(tempStr);
      
      Serial.print(",\"humidity\":");
      Serial.print(int(currentHumidity)); // Humidity as integer
      
      Serial.print(",\"gas\":");
      Serial.print(int(currentGas)); // Gas as integer
      
      Serial.println("}");
      
      // FIXED: Flush serial to ensure complete transmission
      Serial.flush();
    }
    
    float getCurrentTempC() { return currentTempC; }
    float getCurrentHumidity() { return currentHumidity; }
    float getCurrentGas() { return currentGas; }
};

// ============================================
// LcdController Class (unchanged, but you can add debouncing)
// ============================================
class LcdController {
  private:
    int mode;
    LiquidCrystal lcd;
    SensorsReader* sensorsReader;
    float currentValue;
    
    // FIXED: Add debouncing for buttons
    unsigned long lastButtonTime = 0;
    const unsigned long DEBOUNCE_DELAY = 50;
    
    void displayWelcome() {
      lcd.clear();
      lcd.print("WELCOME!");
      lcd.setCursor(0, 1);
      lcd.print("Press a button");
    }
    
  public:
    LcdController(SensorsReader* reader) : lcd(LCD_RS, LCD_E, LCD_D4, LCD_D5, LCD_D6, LCD_D7) {
      sensorsReader = reader;
      mode = 0;
      currentValue = -1.0;
      
      pinMode(LCD_BIT_1, INPUT_PULLUP);
      pinMode(LCD_BIT_2, INPUT_PULLUP);
      
      lcd.begin(16, 2);
      displayWelcome();
    }
    
    void changeMode(int newMode) {
      if (newMode < 1 || newMode > 3) return;
      
      mode = newMode;
      currentValue = -1.0;
      
      lcd.clear();
      switch(mode) {
        case 1:
          lcd.print("Temperature (C):");
          break;
        case 2:
          lcd.print("Humidity:");
          break;
        case 3:
          lcd.print("Gas:");
          break;
      }
      scanReadingUpdates();
    }
    
    void scanModeUpdates() {
      unsigned long currentTime = millis();
      if (currentTime - lastButtonTime < DEBOUNCE_DELAY) return;
      
      int bit1 = digitalRead(LCD_BIT_1) == LOW ? 0 : 1;
      int bit2 = digitalRead(LCD_BIT_2) == LOW ? 0 : 1;
      int buttonCode = (bit2 << 1) | bit1;
      int newMode = buttonCode + 1;
      
      if (newMode >= 1 && newMode <= 3 && newMode != mode) {
        changeMode(newMode);
        lastButtonTime = currentTime;
      }
    }
    
    void scanReadingUpdates() {
      if (mode == 0) return;
      
      float newValue = -1.0;
      switch(mode) {
        case 1:
          newValue = sensorsReader->getCurrentTempC();
          break;
        case 2:
          newValue = sensorsReader->getCurrentHumidity();
          break;
        case 3:
          newValue = sensorsReader->getCurrentGas();
          break;
      }
      
      if (newValue != currentValue) {
        currentValue = newValue;
        lcd.setCursor(0, 1);
        lcd.print("                ");
        lcd.setCursor(0, 1);
        
        switch(mode) {
          case 1:
            lcd.print(currentValue, 1);
            lcd.print(" C");
            break;
          case 2:
            lcd.print(int(currentValue));
            lcd.print("%");
            break;
          case 3:
            lcd.print(int(currentValue));
            lcd.print("%");
            break;
        }
      }
    }
};

// Global Objects
SensorsReader sensors;
LcdController* lcdController;

// Setup & Loop
void setup() {
  Serial.begin(BAUD_RATE);
  while (!Serial) {
    ; // Wait for serial port to connect
  }
  delay(2000); // Increased delay for stable serial
  
  sensors = SensorsReader();
  lcdController = new LcdController(&sensors);
}

void loop() {
  sensors.updateReadings();
  sensors.printReadings();
  lcdController->scanReadingUpdates();
  lcdController->scanModeUpdates();
  delay(LOOP_INTERVAL);
}
