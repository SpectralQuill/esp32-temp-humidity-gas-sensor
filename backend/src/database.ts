import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to SQLite database file
const DB_PATH = path.join(__dirname, "..", "..", "database", "sensor.db");

export class SensorDatabase {
    private db: sqlite3.Database | null = null;

    async initialize(): Promise<void> {
        // Ensure database directory exists
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Create database connection
        await new Promise<void>((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        // Create table if it doesn't exist
        await this.exec(`
      CREATE TABLE IF NOT EXISTS sensor_readings (
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        readingType TEXT NOT NULL CHECK (readingType IN ('temperatureC', 'humidity', 'gas')),
        value REAL NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_readingType_createdAt 
      ON sensor_readings(readingType, createdAt DESC);
      
      CREATE INDEX IF NOT EXISTS idx_createdAt 
      ON sensor_readings(createdAt DESC);
    `);

        console.log(`✅ Database initialized at: ${DB_PATH}`);
    }

    // Helper method for executing SQL
    private exec(sql: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }

            this.db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Helper method for running SQL with parameters
    private run(
        sql: string,
        params: any[] = [],
    ): Promise<{ lastID: number; changes: number }> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }

            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    // Helper method for getting a single row
    private get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }

            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row as T | undefined);
            });
        });
    }

    // Helper method for getting multiple rows
    private all<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }

            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });
    }

    // API Method 1: Create a single reading
    async createReading(
        createdAt: Date,
        readingType: SensorReadingType,
        value: number,
    ): Promise<SensorReading> {
        const createdAtISO = createdAt.toISOString();

        await this.run(
            "INSERT INTO sensor_readings (createdAt, readingType, value) VALUES (?, ?, ?)",
            [createdAtISO, readingType, value],
        );

        return {
            createdAt,
            readingType,
            value,
        };
    }

    // API Method 2: Create multiple readings with same timestamp
    async createReadings(
        temperatureC?: SensorReading,
        humidity?: SensorReading,
        gas?: SensorReading,
    ): Promise<BatchSensorReadingsResult> {
        const readings: SensorReading[] = [];
        const createdAt = new Date();

        // Use provided createdAt or current time
        const timestamp =
            temperatureC?.createdAt ||
            humidity?.createdAt ||
            gas?.createdAt ||
            createdAt;

        if (temperatureC) {
            await this.createReading(
                timestamp,
                "temperatureC",
                temperatureC.value,
            );
            readings.push({ ...temperatureC, createdAt: timestamp });
        }

        if (humidity) {
            await this.createReading(timestamp, "humidity", humidity.value);
            readings.push({ ...humidity, createdAt: timestamp });
        }

        if (gas) {
            await this.createReading(timestamp, "gas", gas.value);
            readings.push({ ...gas, createdAt: timestamp });
        }

        // Build result object
        const result: BatchSensorReadingsResult = {
            createdAt: timestamp,
        };

        readings.forEach((reading) => {
            switch (reading.readingType) {
                case "temperatureC":
                    result.temperatureC = reading;
                    break;
                case "humidity":
                    result.humidity = reading;
                    break;
                case "gas":
                    result.gas = reading;
                    break;
            }
        });

        return result;
    }

    // API Method 3: Get all readings within date range
    async getReadings(
        startDate: Date,
        endDate: Date,
    ): Promise<{
        temperaturesC: SensorReading[];
        humidities: SensorReading[];
        gases: SensorReading[];
    }> {
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();

        const rawReadings = await this.all<DBSensorReading>(
            `SELECT createdAt, readingType, value 
       FROM sensor_readings 
       WHERE createdAt >= ? AND createdAt <= ? 
       ORDER BY createdAt DESC`,
            [startISO, endISO],
        );

        const readings = rawReadings.map(this.convertDBToSensorReading);

        return {
            temperaturesC: readings.filter(
                (r) => r.readingType === "temperatureC",
            ),
            humidities: readings.filter((r) => r.readingType === "humidity"),
            gases: readings.filter((r) => r.readingType === "gas"),
        };
    }

    // API Method 4: Get temperature readings within date range
    async getTemperaturesC(
        startDate: Date,
        endDate: Date,
    ): Promise<SensorReading[]> {
        return this.getReadingsByType("temperatureC", startDate, endDate);
    }

    // API Method 5: Get humidity readings within date range
    async getHumidities(
        startDate: Date,
        endDate: Date,
    ): Promise<SensorReading[]> {
        return this.getReadingsByType("humidity", startDate, endDate);
    }

    // API Method 6: Get gas readings within date range
    async getGases(startDate: Date, endDate: Date): Promise<SensorReading[]> {
        return this.getReadingsByType("gas", startDate, endDate);
    }

    // Helper method for getting readings by type
    private async getReadingsByType(
        type: SensorReadingType,
        startDate: Date,
        endDate: Date,
    ): Promise<SensorReading[]> {
        const startISO = startDate.toISOString();
        const endISO = endDate.toISOString();

        const rawReadings = await this.all<DBSensorReading>(
            `SELECT createdAt, readingType, value 
       FROM sensor_readings 
       WHERE readingType = ? AND createdAt >= ? AND createdAt <= ? 
       ORDER BY createdAt DESC`,
            [type, startISO, endISO],
        );

        return rawReadings.map(this.convertDBToSensorReading);
    }

    // API Method 7: Delete readings within date range
    async deleteReadings(
        startDate: Date | null,
        endDate: Date,
    ): Promise<SensorReading[]> {
        // If startDate is null, get the earliest date from database
        let actualStartDate = startDate;
        if (!actualStartDate) {
            const earliest = await this.get<{ minCreatedAt: string }>(
                "SELECT MIN(createdAt) as minCreatedAt FROM sensor_readings",
            );

            if (!earliest || !earliest.minCreatedAt) {
                return []; // No data to delete
            }

            actualStartDate = new Date(earliest.minCreatedAt);
        }

        const startISO = actualStartDate.toISOString();
        const endISO = endDate.toISOString();

        // First, get the readings that will be deleted
        const toBeDeleted = await this.all<DBSensorReading>(
            `SELECT createdAt, readingType, value 
       FROM sensor_readings 
       WHERE createdAt >= ? AND createdAt <= ? 
       ORDER BY createdAt DESC`,
            [startISO, endISO],
        );

        // Then delete them
        await this.run(
            "DELETE FROM sensor_readings WHERE createdAt >= ? AND createdAt <= ?",
            [startISO, endISO],
        );

        return toBeDeleted.map(this.convertDBToSensorReading);
    }

    // Helper method to convert database row to SensorReading
    private convertDBToSensorReading(dbRow: DBSensorReading): SensorReading {
        return {
            createdAt: new Date(dbRow.createdAt),
            readingType: dbRow.readingType,
            value: dbRow.value,
        };
    }

    // Additional useful methods

    // Get latest reading for each type
    async getLatestReadings(): Promise<{
        temperatureC?: SensorReading;
        humidity?: SensorReading;
        gas?: SensorReading;
    }> {
        const types: SensorReadingType[] = ["temperatureC", "humidity", "gas"];
        const result: any = {};

        for (const type of types) {
            const reading = await this.get<DBSensorReading>(
                `SELECT createdAt, readingType, value 
         FROM sensor_readings 
         WHERE readingType = ? 
         ORDER BY createdAt DESC 
         LIMIT 1`,
                [type],
            );

            if (reading) {
                const key = type === "temperatureC" ? "temperatureC" : type;
                result[key] = this.convertDBToSensorReading(reading);
            }
        }

        return result;
    }

    // Reset database (for CLI)
    async resetDatabase(): Promise<void> {
        await this.exec("DROP TABLE IF EXISTS sensor_readings");
        console.log("🗑️  Database table dropped");

        // Reinitialize
        await this.initialize();
        console.log("✅ Database reinitialized");
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }

            this.db.close((err) => {
                if (err) reject(err);
                else {
                    this.db = null;
                    resolve();
                }
            });
        });
    }
}

// Singleton instance
export const sensorDB = new SensorDatabase();
