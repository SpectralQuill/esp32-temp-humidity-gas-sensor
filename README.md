# **ESP32 Temp + Humidity + Gas Sensor**
- Submitted by: **Gian Tristian G. Apostol**
- Course: **Architecture and Organization (Computer Studies)**

## Project Background
- Language: **TypeScript**
- Frontend: **Vite + React + Sass**
- Backend: **CORS + Kysely**
- Database: **SQLite**

## Requirements
- Node.js
- Arduino IDE
- CP210x USB to UART Bridge VCP Drivers (Download Link: [Silicon Labs](https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers?tab=downloads))

## Setup and Running
1. Run to install dependencies:
```bash
npm run init
```
2. Duplicate [.env.example](.env.example) as [.env](.env).
3. Fill up missing environmental variables in [.env](.env).
4. Run to obtain IPv4 address in current WLAN connection.
```bash
npm run get-ip
```
5. Open [esp32/src/v2/v2.ino](esp32/src/v2/v2.ino) in Arduino IDE and fill up the following variable:
    - ssid: Your WiFi SSID
    - password: Your WiFi password
    - serverHost: Your server host IPv4 address (the one obtained in #4)
6. Upload Arduino code to ESP32.
7. Run to start backend server:
```bash
npm run backend
```
8. Run to start frontend server:
```bash
npm run frontend
```
9. If successful, the following should happen:
    - The serial monitor in Arduino IDE repeatedly log a successful POST request. Default is every 2 seconds.
    - The frontend webpage shows three graphs with repeatedly updating points. Default is every 2 seconds.
    - The backend in console repeatedly logs acknowledgment of health check requests and POST requests from the ESP32.
