import { ApiConfig } from "../utils/ApiConfig";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { sensorDB } from "./database";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
let apiConfig: ApiConfig;

try {

    apiConfig = new ApiConfig(
        process.env.API_HOST,
        process.env.API_PORT,
    );

} catch (error) {

    console.error(
        "Invalid API configuration. Please check your .env file for API_HOST and API_PORT.",
    );
    process.exit(1);

}

const HOST = apiConfig.getHost();
const PORT = apiConfig.getPort();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
await sensorDB.initialize();

// ===== API METHODS =====

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "ESP32 Sensor API",
        timestamp: new Date().toISOString(),
        database: "SQLite",
        uptime: process.uptime(),
    });
});

// API Method 1: Create a single reading
app.post("/api/reading", async (req, res) => {
    try {
        const { createdAt, readingType, value } = req.body;

        // Validate input
        if (!createdAt || !readingType || value === undefined) {
            return res.status(400).json({
                error: "Missing required fields: createdAt, readingType, value",
            });
        }

        if (!["temperatureC", "humidity", "gas"].includes(readingType)) {
            return res.status(400).json({
                error: "Invalid readingType. Must be temperatureC, humidity, or gas",
            });
        }

        if (typeof value !== "number" || isNaN(value)) {
            return res.status(400).json({ error: "Value must be a number" });
        }

        const date = new Date(createdAt);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: "Invalid createdAt date" });
        }

        const reading = await sensorDB.createReading(date, readingType, value);
        res.status(201).json(reading);
    } catch (error) {
        console.error("Error creating reading:", error);
        res.status(500).json({ error: "Failed to create reading" });
    }
});

// API Method 2: Create multiple readings
app.post("/api/readings", async (req, res) => {
    try {
        const { temperatureC, humidity, gas } = req.body;

        // At least one reading must be provided
        if (!temperatureC && !humidity && !gas) {
            return res.status(400).json({
                error: "At least one reading (temperatureC, humidity, or gas) must be provided",
            });
        }

        const result = await sensorDB.createReadings(
            temperatureC,
            humidity,
            gas,
        );
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating readings:", error);
        res.status(500).json({ error: "Failed to create readings" });
    }
});

// API Method 3: Get all readings within date range
app.get("/api/readings", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res
                .status(400)
                .json({ error: "Both startDate and endDate are required" });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const readings = await sensorDB.getReadings(start, end);
        res.json(readings);
    } catch (error) {
        console.error("Error getting readings:", error);
        res.status(500).json({ error: "Failed to get readings" });
    }
});

// API Method 4: Get temperature readings
app.get("/api/readings/temperature", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res
                .status(400)
                .json({ error: "Both startDate and endDate are required" });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const readings = await sensorDB.getTemperaturesC(start, end);
        res.json(readings);
    } catch (error) {
        console.error("Error getting temperature readings:", error);
        res.status(500).json({ error: "Failed to get temperature readings" });
    }
});

// API Method 5: Get humidity readings
app.get("/api/readings/humidity", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res
                .status(400)
                .json({ error: "Both startDate and endDate are required" });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const readings = await sensorDB.getHumidities(start, end);
        res.json(readings);
    } catch (error) {
        console.error("Error getting humidity readings:", error);
        res.status(500).json({ error: "Failed to get humidity readings" });
    }
});

// API Method 6: Get gas readings
app.get("/api/readings/gas", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res
                .status(400)
                .json({ error: "Both startDate and endDate are required" });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        const readings = await sensorDB.getGases(start, end);
        res.json(readings);
    } catch (error) {
        console.error("Error getting gas readings:", error);
        res.status(500).json({ error: "Failed to get gas readings" });
    }
});

// API Method 7: Delete readings within date range
app.delete("/api/readings", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!endDate) {
            return res.status(400).json({ error: "endDate is required" });
        }

        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid endDate format" });
        }

        const start = startDate ? new Date(startDate as string) : null;
        if (startDate && isNaN(start!.getTime())) {
            return res.status(400).json({ error: "Invalid startDate format" });
        }

        const deleted = await sensorDB.deleteReadings(start, end);
        res.json({
            message: `Deleted ${deleted.length} readings`,
            deleted: deleted,
        });
    } catch (error) {
        console.error("Error deleting readings:", error);
        res.status(500).json({ error: "Failed to delete readings" });
    }
});

// ===== ADDITIONAL USEFUL ENDPOINTS =====

// Get latest readings (all types)
app.get("/api/readings/latest", async (req, res) => {
    try {
        const latest = await sensorDB.getLatestReadings();
        res.json(latest);
    } catch (error) {
        console.error("Error getting latest readings:", error);
        res.status(500).json({ error: "Failed to get latest readings" });
    }
});

// ESP32 compatible endpoint
app.post("/api/esp32/readings", async (req, res) => {
    try {
        const { temperatureC, humidity, gas } = req.body;
        const createdAt = new Date();

        const readings: any = {};

        if (temperatureC !== undefined) {
            readings.temperatureC = {
                createdAt,
                readingType: "temperatureC" as const,
                value: parseFloat(temperatureC),
            };
        }

        if (humidity !== undefined) {
            readings.humidity = {
                createdAt,
                readingType: "humidity" as const,
                value: parseFloat(humidity),
            };
        }

        if (gas !== undefined) {
            readings.gas = {
                createdAt,
                readingType: "gas" as const,
                value: parseFloat(gas),
            };
        }

        const result = await sensorDB.createReadings(
            readings.temperatureC,
            readings.humidity,
            readings.gas,
        );

        res.status(201).json(result);
    } catch (error) {
        console.error("Error saving ESP32 readings:", error);
        res.status(500).json({ error: "Failed to save ESP32 readings" });
    }
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`
🚀 ESP32 Sensor API Server
===========================
📍 Port: ${PORT}
💾 Database: SQLite (database/sensor.db)
🔗 Health check: http://${HOST}:${PORT}/health

📝 YOUR EXACT API METHODS:
  POST   /api/reading          - createReading(createdAt, readingType, value)
  POST   /api/readings         - createReadings(temperatureC?, humidity?, gas?)
  GET    /api/readings         - getReadings(startDate, endDate)
  GET    /api/readings/temperature - getTemperaturesC(startDate, endDate)
  GET    /api/readings/humidity    - getHumidities(startDate, endDate)
  GET    /api/readings/gas         - getGases(startDate, endDate)
  DELETE /api/readings         - deleteReadings(startDate?, endDate)

📝 ADDITIONAL ENDPOINTS:
  GET    /api/readings/latest  - Get latest readings of each type
  GET    /api/readings/stats   - Get statistics
  POST   /api/esp32/readings   - ESP32 compatible endpoint
  `);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("Shutting down gracefully...");
    await sensorDB.close();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await sensorDB.close();
    process.exit(0);
});
