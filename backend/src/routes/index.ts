import { Router } from "express";
import temperatureRoutes from "./temperature_c.routes";
import humidityRoutes from "./humidity.routes";
import gasRoutes from "./gas.routes";
import { StatisticsService } from "../services/statistics.service";

const router = Router();

// Health check
router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "ESP32 Sensor API",
    });
});

// Combined endpoints for ESP32
router.post("/readings", async (req, res) => {
    try {
        const { temperature, humidity, gas } = req.body;
        const results = [];

        if (temperature !== undefined) {
            const tempReading =
                await import("../services/temperature_c.service").then(
                    (module) => module.TemperatureCService.create(temperature),
                );
            results.push({ type: "temperature", data: tempReading });
        }

        if (humidity !== undefined) {
            const humidityReading =
                await import("../services/humidity.service").then((module) =>
                    module.HumidityService.create(humidity),
                );
            results.push({ type: "humidity", data: humidityReading });
        }

        if (gas !== undefined) {
            const gasReading = await import("../services/gas.service").then(
                (module) => module.GasService.create(gas),
            );
            results.push({ type: "gas", data: gasReading });
        }

        res.status(201).json({ success: true, readings: results });
    } catch (error) {
        console.error("Error saving readings:", error);
        res.status(500).json({ error: "Failed to save readings" });
    }
});

router.get("/readings/latest", async (req, res) => {
    try {
        const readings = await StatisticsService.getAllLatest();
        res.json(readings);
    } catch (error) {
        console.error("Error fetching latest readings:", error);
        res.status(500).json({ error: "Failed to fetch latest readings" });
    }
});

router.get("/readings/all", async (req, res) => {
    try {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
        const {
            limit = 50,
            offset,
            startDate = oneMinuteAgo,
            endDate = now,
        } = req.query;
        const readings = await StatisticsService.getAll({
            limit: parseInt(limit as string),
            offset: offset ? parseInt(offset as string) : undefined,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        });
        res.json(readings);
    } catch (error) {
        console.error("Error fetching recent readings:", error);
        res.status(500).json({ error: "Failed to fetch recent readings" });
    }
});

// Mount individual routes
router.use("/temperature", temperatureRoutes);
router.use("/humidity", humidityRoutes);
router.use("/gas", gasRoutes);

export default router;
