import { Router } from "express";
import { body, query } from "express-validator";
import { HumidityController } from "../controllers/humidity.controller";

const router = Router();

// Validation middleware
const validateReading = [
    body("value")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Humidity must be between 0% and 100%"),
];

const validateQuery = [
    query("limit").optional().isInt({ min: 1, max: 1000 }),
    query("offset").optional().isInt({ min: 0 }),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("days").optional().isInt({ min: 1, max: 365 }),
];

// Routes
router.post("/", validateReading, HumidityController.create);
router.get("/", validateQuery, HumidityController.getAll);
router.get("/latest", HumidityController.getLatest);
router.delete("/old", validateQuery, HumidityController.deleteOld);

export default router;
