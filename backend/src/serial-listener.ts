import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import dotenv from "dotenv";

dotenv.config();

// Configuration from environment variables
const SERIAL_PORT = process.env.SERIAL_PORT || "COM2"; // or /dev/ttyUSB0, /dev/ttyACM0
const SERIAL_BAUD_RATE = process.env.SERIAL_BAUD_RATE
    ? parseInt(process.env.SERIAL_BAUD_RATE)
    : 115200;
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const MAX_RETRIES = process.env.SERIAL_MAX_RETRIES
    ? parseInt(process.env.SERIAL_MAX_RETRIES)
    : 3;
const RETRY_DELAY = process.env.SERIAL_RETRY_DELAY
    ? parseInt(process.env.SERIAL_RETRY_DELAY)
    : 5000;
const SERIAL_DATA_BITS = (
    process.env.SERIAL_DATA_BITS ? parseInt(process.env.SERIAL_DATA_BITS) : 8
) as 8 | 7 | 6 | 5;
const SERIAL_PARITY = (process.env.SERIAL_PARITY || "none") as
    | "none"
    | "even"
    | "odd"
    | "mark"
    | "space";
const SERIAL_STOP_BITS = (
    process.env.SERIAL_STOP_BITS ? parseInt(process.env.SERIAL_STOP_BITS) : 1
) as 1 | 1.5 | 2;

console.log(`
🔌 ESP32 Serial Listener
========================
📡 Serial Port: ${SERIAL_PORT}
⚡ Baud Rate: ${SERIAL_BAUD_RATE}
🌐 API Server: ${API_BASE_URL}
🔄 Max Retries: ${MAX_RETRIES}
⏱️  Retry Delay: ${RETRY_DELAY}ms
`);

class SerialListener {
    private port: SerialPort | null = null;
    private parser: ReadlineParser | null = null;
    private retryCount = 0;
    private isConnected = false;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    constructor() {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            console.log(
                `🔗 Connecting to ${SERIAL_PORT} at ${SERIAL_BAUD_RATE} baud...`,
            );

            this.port = new SerialPort({
                path: SERIAL_PORT,
                baudRate: SERIAL_BAUD_RATE,
                dataBits: SERIAL_DATA_BITS,
                parity: SERIAL_PARITY,
                stopBits: SERIAL_STOP_BITS,
                autoOpen: true,
            });

            this.parser = this.port.pipe(
                new ReadlineParser({ delimiter: "\n" }),
            );

            this.setupEventHandlers();

            await this.waitForConnection();
        } catch (error) {
            console.error(`❌ Failed to initialize serial port: ${error}`);
            this.scheduleReconnect();
        }
    }

    private setupEventHandlers(): void {
        if (!this.port) return;

        this.port.on("open", () => {
            console.log(`✅ Connected to ${SERIAL_PORT}`);
            console.log("=".repeat(50));
            this.isConnected = true;
            this.retryCount = 0;

            // Clear any reconnect timeout
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }

            // Check API health on connection
            this.checkApiHealth();
        });

        this.port.on("error", (error: Error) => {
            console.error(`❌ Serial port error: ${error.message}`);
            this.isConnected = false;
            this.scheduleReconnect();
        });

        this.port.on("close", () => {
            console.log("📴 Serial port closed");
            this.isConnected = false;
            this.scheduleReconnect();
        });

        if (this.parser) {
            this.parser.on("data", this.handleIncomingData.bind(this));
        }
    }

    private async checkApiHealth(): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ API is healthy (${data.status})`);
            } else {
                console.warn(`⚠️ API health check returned ${response.status}`);
            }
        } catch (error) {
            console.error("❌ API health check failed:", error);
            console.log("Make sure the API server is running at", API_BASE_URL);
        }
    }

    private async waitForConnection(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.port) {
                reject(new Error("Port not initialized"));
                return;
            }

            const timeout = setTimeout(() => {
                reject(new Error("Serial connection timeout"));
            }, 10000);

            this.port.once("open", () => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimeout || this.retryCount >= MAX_RETRIES) {
            if (this.retryCount >= MAX_RETRIES) {
                console.error(
                    `❌ Max retries (${MAX_RETRIES}) reached. Giving up.`,
                );
                process.exit(1);
            }
            return;
        }

        this.retryCount++;
        const delay = RETRY_DELAY * this.retryCount; // Exponential backoff

        console.log(
            `🔄 Reconnecting in ${delay}ms (Attempt ${this.retryCount}/${MAX_RETRIES})...`,
        );

        this.reconnectTimeout = setTimeout(async () => {
            try {
                await this.cleanup();
                await this.initialize();
            } catch (error) {
                console.error("Reconnect failed:", error);
                this.scheduleReconnect();
            }
        }, delay);
    }

    private handleIncomingData(data: string): void {
        const rawData = data.trim();
        const timestamp = new Date();

        try {
            // Log raw data
            const timeStr = timestamp.toISOString().split("T")[1].split(".")[0];
            console.log(`[${timeStr}] ${rawData}`);

            // Parse directly as JSON
            const cleanData = rawData.replace(/\\/g, "");
            const jsonData = JSON.parse(cleanData);

            // Create sensor data object
            const sensorData: Esp32Data = {
                raw: rawData,
                timestamp,
                temperatureC:
                    jsonData.temperatureC !== undefined
                        ? parseFloat(jsonData.temperatureC)
                        : undefined,
                humidity:
                    jsonData.humidity !== undefined
                        ? parseFloat(jsonData.humidity)
                        : undefined,
                gas:
                    jsonData.gas !== undefined
                        ? parseFloat(jsonData.gas)
                        : undefined,
            };

            if (
                sensorData.temperatureC !== undefined ||
                sensorData.humidity !== undefined ||
                sensorData.gas !== undefined
            ) {
                // Process and send all valid data to API
                // The API will handle duplicate filtering
                this.processEsp32Data(sensorData);
            } else {
                console.log("⚠️  No valid sensor data found in:", rawData);
            }
        } catch (error) {
            console.error("Error processing serial data:", error);
            console.log("Raw data that failed:", rawData);
        }
    }

    private processEsp32Data(sensorData: Esp32Data): void {
        const payload: any = {};

        // Validate and add temperature data if present
        if (sensorData.temperatureC !== undefined) {
            // Basic validation for temperature
            if (sensorData.temperatureC <= 45 && sensorData.temperatureC >= -15) {
                payload.temperatureC = sensorData.temperatureC;
            }
        }

        // Validate and add humidity data if present
        if (sensorData.humidity !== undefined) {
            // Basic validation for humidity
            if (sensorData.humidity >= 0 && sensorData.humidity <= 100) {
                payload.humidity = sensorData.humidity;
            }
        }

        // Validate and add gas data if present
        if (sensorData.gas !== undefined) {
            // Basic validation for gas
            if (sensorData.gas >= 0 && sensorData.gas <= 100) {
                payload.gas = sensorData.gas;
            }
        }

        // Send to API if there's any valid data
        // API will handle duplicate filtering
        if (Object.keys(payload).length > 0) {
            this.sendToApi(payload);
        } else {
            console.log("⚠️  No valid sensor data to send");
        }
    }

    private async sendToApi(payload: any): Promise<void> {
        const apiUrl = `${API_BASE_URL}/api/esp32/readings`;

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
            } else {
                console.error(
                    `❌ API error: ${response.status} ${response.statusText}`,
                );
                const errorText = await response.text();
                console.error(`Error details: ${errorText}`);
            }
        } catch (error) {
            console.error("❌ Failed to send data to API:", error);
            console.log("Is the API server running at", API_BASE_URL, "?");
            console.log("Run: npm run dev in the backend directory");
        }
    }

    public async sendCommand(command: string): Promise<void> {
        if (!this.isConnected || !this.port) {
            throw new Error("Serial port not connected");
        }

        return new Promise((resolve, reject) => {
            this.port!.write(command + "\n", (error) => {
                if (error) {
                    reject(error);
                } else {
                    this.port!.drain(() => {
                        console.log(`📤 Sent command: ${command}`);
                        resolve();
                    });
                }
            });
        });
    }

    public async cleanup(): Promise<void> {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.port && this.isConnected) {
            return new Promise((resolve) => {
                this.port!.close((error) => {
                    if (error) console.error("Error closing port:", error);
                    this.isConnected = false;
                    resolve();
                });
            });
        }
    }
}

// ===== MAIN EXECUTION =====

const listener = new SerialListener();

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down serial listener...");

    try {
        await listener.cleanup();
        console.log("✅ Serial listener stopped gracefully");
    } catch (error) {
        console.error("Error during shutdown:", error);
    }

    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\n🛑 Received SIGTERM, shutting down...");

    try {
        await listener.cleanup();
        console.log("✅ Serial listener stopped gracefully");
    } catch (error) {
        console.error("Error during shutdown:", error);
    }

    process.exit(0);
});

// Keep process alive
process.stdin.resume();
