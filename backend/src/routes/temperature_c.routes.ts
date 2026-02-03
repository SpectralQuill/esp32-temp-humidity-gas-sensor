import { Router } from "express";
import { body, query } from "express-validator";
import { TemperatureCController } from "../controllers/temperature_c.controller";

const router = Router();

// Validation middleware
const validateReading = [
    body("value")
        .isFloat({ min: -50, max: 100 })
        .withMessage("Temperature must be between -50°C and 100°C"),
];

const validateQuery = [
    query("limit").optional().isInt({ min: 1, max: 1000 }),
    query("offset").optional().isInt({ min: 0 }),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("days").optional().isInt({ min: 1, max: 365 }),
];

// Routes
router.post("/", validateReading, TemperatureCController.create);
router.get("/", validateQuery, TemperatureCController.getAll);
router.get("/latest", TemperatureCController.getLatest);
router.delete("/old", validateQuery, TemperatureCController.deleteOld);

export default router;
