// #include <DHT.h>

// // ================= CONFIG =================
// #define LEDPIN 2
// #define DHTPIN 33          // DHT11 connected to GPIO33
// #define DHTTYPE DHT11
// #define MQ135_PIN 32       // MQ135 analog output connected to GPIO32

// const unsigned long PRINT_INTERVAL_MS = 2000;  // 500 ms interval
// // ===========================================

// DHT dht(DHTPIN, DHTTYPE);

// bool blinkState = false;

// void setup() {
//   pinMode(LEDPIN, OUTPUT);
//   pinMode(DHTPIN, INPUT);
//   Serial.begin(115200);
//   dht.begin();
//   delay(PRINT_INTERVAL_MS);
// }

// void loop() {

//   delay(PRINT_INTERVAL_MS);

//   if (blinkState) {
//     blinkState = false;
//     digitalWrite(LEDPIN, LOW);
//   } else {
//     blinkState = true;
//     digitalWrite(LEDPIN, HIGH);
//   }

//   float temperatureC = dht.readTemperature();
//   float humidity = dht.readHumidity();
//   // int gas = -1;
//   int gas = analogRead(MQ135_PIN);

//   // Check if DHT read failed
//   if (isnan(temperatureC) || isnan(humidity)) {
//     Serial.print("{\"error\":\"DHT read failed 5\"}" );
//     Serial.println();
//     return;


//   }

//   // Print JSON format
//   Serial.print("{\"temperatureC\":");
//   Serial.print(temperatureC, 2);
//   Serial.print(",\"humidity\":");
//   Serial.print(humidity, 2);
//   Serial.print(",\"gas\":");
//   Serial.print(gas);
//   Serial.println("}");

// }

#include <WiFi.h>
#include <HTTPClient.h>

// ================= CONFIG =================
const char* ssid = "GTGA";
const char* password = "specquil";
const char* serverIP = "10.62.181.252:3000";  // <-- Change this

const unsigned long REQUEST_INTERVAL_MS = 5000;
// ===========================================

unsigned long previousMillis = 0;

void connectToWiFi() {
  Serial.print("Connecting to WiFi");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  connectToWiFi();
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= REQUEST_INTERVAL_MS) {
    previousMillis = currentMillis;

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;

      String url = String("http://") + serverIP + "/health";

      Serial.print("Sending GET to: ");
      Serial.println(url);

      http.begin(url);
      int httpCode = http.GET();

      if (httpCode > 0) {
        Serial.print("HTTP Code: ");
        Serial.println(httpCode);

        String payload = http.getString();
        Serial.print("Response: ");
        Serial.println(payload);
      } else {
        Serial.print("Request failed, error: ");
        Serial.println(http.errorToString(httpCode));
      }

      http.end();
    } else {
      Serial.println("WiFi disconnected. Reconnecting...");
      connectToWiFi();
    }
  }
}


