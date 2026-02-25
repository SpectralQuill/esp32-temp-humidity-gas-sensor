#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ================= CONFIG =================
#define LEDPIN 2
#define DHTPIN 33
#define DHTTYPE DHT11
#define MQ135_PIN 32

const char* ssid = "GTGA";
const char* password = "specquil";
const char* serverHost = "10.156.118.252:3000";

const unsigned long REQUEST_INTERVAL_MS = 2000;
const unsigned long HEALTH_RETRY_MS = 3000;
// ===========================================

DHT dht(DHTPIN, DHTTYPE);

unsigned long previousMillis = 0;
bool ledState = false;
bool backendHealthy = false;

// ================= WIFI =================

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

// ================= HEALTH CHECK =================

bool checkBackendHealth() {
  HTTPClient http;
  String url = String("http://") + serverHost + "/health";

  Serial.println("Checking backend health...");
  http.begin(url);

  int httpCode = http.GET();

  if (httpCode != 200) {
    Serial.println("Health endpoint not reachable.");
    http.end();
    return false;
  }

  String payload = http.getString();
  http.end();

  Serial.println("Health response:");
  Serial.println(payload);

  bool healthy = payload.indexOf("\"status\":\"healthy\"") >= 0;
  bool dbReachable = payload.indexOf("\"databaseStatus\":\"reachable\"") >= 0;

  return healthy && dbReachable;
}

// ================= SETUP =================

void setup() {
  Serial.begin(115200);

  pinMode(LEDPIN, OUTPUT);
  pinMode(MQ135_PIN, INPUT);

  dht.begin();
  delay(1000);

  connectToWiFi();

  while (!backendHealthy) {
    backendHealthy = checkBackendHealth();

    if (!backendHealthy) {
      Serial.println("Backend unhealthy. Retrying...");
      digitalWrite(LEDPIN, HIGH);
      delay(200);
      digitalWrite(LEDPIN, LOW);
      delay(HEALTH_RETRY_MS);
    }
  }

  Serial.println("Backend healthy. Starting data transmission.");
}

// ================= LOOP =================

void loop() {
  if (!backendHealthy) return;

  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= REQUEST_INTERVAL_MS) {
    previousMillis = currentMillis;

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi disconnected. Reconnecting...");
      connectToWiFi();
      return;
    }

    float temperatureC = dht.readTemperature();
    float humidity = dht.readHumidity();
    int gasRaw = analogRead(MQ135_PIN);

    if (isnan(temperatureC) || isnan(humidity)) {
      Serial.println("{\"error\":\"DHT read failed\"}");
      return;
    }

    float gas = (float)gasRaw / 4095.0;

    String json = "{";
    json += "\"temperatureC\":" + String(temperatureC, 1) + ",";
    json += "\"humidity\":" + String(humidity / 100.0, 2) + ",";
    json += "\"gas\":" + String(gas, 2);
    json += "}";

    String url = String("http://") + serverHost + "/api/reading";

    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(json);

    if (httpCode >= 200 && httpCode < 300) {
      Serial.println("POST successful: " + json);
      ledState = !ledState;
      digitalWrite(LEDPIN, ledState ? HIGH : LOW);
    } else {
      Serial.print("POST failed: ");
      Serial.println(httpCode);
    }

    http.end();
  }
}
