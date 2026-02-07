// Configuration constants
const unsigned long LOOP_INTERVAL = 125; // milliseconds
// const unsigned long LOG_INTERVAL = 1000;
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
// SensorsReader Class
// ============================================
class SensorsReader {
  private:
    float currentTempC;
    float currentHumidity;
    float currentGas;
    
    float roundToHalf(float value) {
      // Round to 0, 0.5, or 1
      float decimal = value - int(value);
      if (decimal < 0.25) return float(int(value));
      else if (decimal < 0.75) return float(int(value)) + 0.5;
      else return float(int(value)) + 1.0;
    }
    
    float roundToInteger(float value) {
      // Round to 0 or 1 (basically just cast to int)
      float decimal = value - int(value);
      if (decimal < 0.5) return float(int(value));
      return float(int(value)) + 1.0;
    }
    
    float convertAnalogToTempC(float analogValue) {
      // y = 0.321364x - 0.100672
      float temp = (0.321364 * analogValue) - 0.100672;
      return roundToHalf(temp);
    }
    
    float convertAnalogToPercentage(float analogValue) {
      // y = 0.097655x + 0.001815
      float percentage = (0.097655 * analogValue) + 0.001815;
      return roundToInteger(percentage);
    }
    
    float getModeValue(const int readings[], int size) {
      // Calculate mode (most frequent value)
      if (size == 0) return 0.0;
      
      int maxCount = 0;
      float mode = readings[0];
      
      for (int i = 0; i < size; i++) {
        int count = 0;
        for (int j = 0; j < size; j++) {
          if (readings[j] == readings[i]) count++;
        }
        if (count > maxCount) {
          maxCount = count;
          mode = readings[i];
        }
      }
      return mode;
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
      // Read all temperature pins and get mode value
      int tempReadings[sizeof(TEMP_PINS)/sizeof(TEMP_PINS[0])];
      for (int i = 0; i < sizeof(TEMP_PINS)/sizeof(TEMP_PINS[0]); i++) {
        tempReadings[i] = analogRead(TEMP_PINS[i]);
      }
      float modeValue = getModeValue(tempReadings, sizeof(TEMP_PINS)/sizeof(TEMP_PINS[0]));
      return convertAnalogToTempC(modeValue);
    }
    
    float readHumidity() {
      int analogValue = analogRead(HUMIDITY_PIN);
      return convertAnalogToPercentage(analogValue);
    }
    
    float readGas() {
      int analogValue = analogRead(GAS_PIN);
      return convertAnalogToPercentage(analogValue);
    }
    
    void updateReadings() {
      currentTempC = readTempC();
      currentHumidity = readHumidity();
      currentGas = readGas();
    }
    
    void printReadings() {
      Serial.print("{\"temperatureC\":");
      Serial.print(currentTempC);
      Serial.print(",\"humidity\":");
      Serial.print(currentHumidity);
      Serial.print(",\"gas\":");
      Serial.print(currentGas);
      Serial.println("}");
    }
    
    float getCurrentTempC() { return currentTempC; }
    float getCurrentHumidity() { return currentHumidity; }
    float getCurrentGas() { return currentGas; }
};

// ============================================
// LcdController Class
// ============================================
class LcdController {
  private:
    int mode; // 0=Welcome, 1=Temp, 2=Humidity, 3=Gas
    LiquidCrystal lcd;
    SensorsReader* sensorsReader;
    float currentValue;
    
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
      
      // Initialize button pins
      pinMode(LCD_BIT_1, INPUT_PULLUP);
      pinMode(LCD_BIT_2, INPUT_PULLUP);
      
      // Initialize LCD
      lcd.begin(16, 2);
      displayWelcome();
    }
    
    void changeMode(int newMode) {
      if (newMode < 1 || newMode > 3) return;
      
      mode = newMode;
      currentValue = -1.0; // Reset to force display update
      
      lcd.clear();
      switch(mode) {
        case 1: // Temperature
          lcd.print("Temperature (C):");
          break;
        case 2: // Humidity
          lcd.print("Humidity:");
          break;
        case 3: // Gas
          lcd.print("Gas:");
          break;
      }
      
      // Force immediate display update
      scanReadingUpdates();
    }
    
    void scanModeUpdates() {
      // Read 2-bit button encoding
      // LOW = 0, HIGH = 1 (due to INPUT_PULLUP)
      int bit1 = digitalRead(LCD_BIT_1) == LOW ? 0 : 1;
      int bit2 = digitalRead(LCD_BIT_2) == LOW ? 0 : 1;
      
      // Combine bits: bit2 is MSB, bit1 is LSB
      int buttonCode = (bit2 << 1) | bit1;
      int newMode = buttonCode + 1; // Convert 0-3 to 1-4
      
      // If newMode is 4, it means no button or invalid combination
      // Only change mode if valid (1-3) and different from current
      if (newMode >= 1 && newMode <= 3 && newMode != mode) {
        changeMode(newMode);
      }
    }
    
    void scanReadingUpdates() {
      if (mode == 0) return; // Welcome screen, no sensor updates
      
      float newValue = -1.0;
      
      // Get appropriate sensor reading
      switch(mode) {
        case 1: // Temperature
          newValue = sensorsReader->getCurrentTempC();
          break;
        case 2: // Humidity
          newValue = sensorsReader->getCurrentHumidity();
          break;
        case 3: // Gas
          newValue = sensorsReader->getCurrentGas();
          break;
      }
      
      // Update display if value changed
      if (newValue != currentValue) {
        currentValue = newValue;
        
        lcd.setCursor(0, 1);
        lcd.print("                "); // Clear line
        lcd.setCursor(0, 1);
        
        switch(mode) {
          case 1: // Temperature with 1 decimal
            lcd.print(currentValue, 1);
            lcd.print(" C");
            break;
          case 2: // Humidity as integer
            lcd.print(int(currentValue));
            lcd.print("%");
            break;
          case 3: // Gas as integer
            lcd.print(int(currentValue));
            lcd.print("%");
            break;
        }
      }
    }
};

// ============================================
// Global Objects
// ============================================
SensorsReader sensors;
LcdController* lcdController;
// unsigned long loopTracker = 0;

// ============================================
// Setup & Loop
// ============================================
void setup() {
  Serial.begin(BAUD_RATE);
  delay(1000); // Wait for serial to initialize
  
  sensors = SensorsReader();
  lcdController = new LcdController(&sensors);
}

void loop() {
  sensors.updateReadings();
  sensors.printReadings();
  lcdController->scanReadingUpdates();
  lcdController->scanModeUpdates();
  delay(LOOP_INTERVAL);
  // loopTracker += LOOP_INTERVAL;
  // if(loopTracker >= LOG_INTERVAL) {
  //   loopTracker = 0;

  // }
}
