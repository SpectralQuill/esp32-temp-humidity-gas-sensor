import { DateUtils } from "../utils/DateUtils";
import {
    Esp32DatabaseSchema,
    Esp32KyselyClient,
    Esp32DatabaseTableNames
} from "./kyselyClient";
import { format as formatDate } from "date-fns";
import { Kysely } from "kysely";

const DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

export const SENSOR_READING_BUCKET_TEMPLATE = {
    temperatureC: 0,
    humidity: 0,
    gas: 0,
    readingsCount: 0
} as const satisfies SensortReadingBucket;

export class Esp32SqliteService {

    private static readonly databaseName: string = "SQLite";
    
    private static convertSensorReadingRow(row: SensorReadingRow): SensorReading {

        return {
            createdAt: new Date(row.createdAt),
            temperatureC: row.temperatureC,
            humidity: row.humidity,
            gas: row.gas
        };

    }

    private kyselyClient: Esp32KyselyClient | null = null;
    private serviceName: string;

    public constructor() {

        const { API_SERVICE_NAME } = process.env;
        if (!API_SERVICE_NAME) throw new Error("API_SERVICE_NAME env variable not set");
        this.serviceName = API_SERVICE_NAME;

    }

    private get database(): Kysely<Esp32DatabaseSchema> {

        if (!this.kyselyClient) throw new Error("Kysely client not initialized");
        return this.kyselyClient.connection;
        
    }

    public async initialize(): Promise<void> {

        if (this.kyselyClient) return;
        this.kyselyClient = new Esp32KyselyClient();
        await this.kyselyClient.initialize();

    }

    public async close(): Promise<void> {

        const { kyselyClient } = this;
        if (!kyselyClient) return;
        await kyselyClient.connection.destroy();
        this.kyselyClient = null;
    
    }
    
    public async createReading(
        createdAt: Date | null,
        temperatureC: number,
        humidity: number,
        gas: number
    ): Promise<SensorReading> {
        
        if (!createdAt) createdAt = new Date();
        const reading: SensorReadingRow = {
            createdAt: createdAt.toISOString(),
            temperatureC,
            humidity,
            gas
        };
        
        await this.database.insertInto(Esp32DatabaseTableNames.SensorReadings).values(reading).execute();
        
        const formattedDate = formatDate(createdAt, DATE_FORMAT);
        console.log(
            `✅ Created reading at ${formattedDate} - Temp: ${
            temperatureC}°C, Humidity: ${humidity}, Gas: ${gas}`
        );
        
        return { createdAt, temperatureC, humidity, gas };
        
    }
    
    public async getHealth(): Promise<ApiHealth> {

        const { serviceName } = this;
        try {

            const data = await this.database
                .selectFrom(Esp32DatabaseTableNames.SensorReadings)
                .select("createdAt")
                .limit(1)
                .execute()
            ;
            return {
                status: "healthy",
                service: serviceName,
                timestamp: new Date().toISOString(),
                database: Esp32SqliteService.databaseName,
                databaseStatus: "reachable",
                uptime: process.uptime(),
                sampleReadingExists: data.length > 0
            };

        } catch {

            return {
                status: "unhealthy",
                service: serviceName,
                timestamp: new Date().toISOString(),
                database: Esp32SqliteService.databaseName,
                databaseStatus: "unreachable",
                uptime: 0,
                sampleReadingExists: false
            };

        }

    }
    
    public async getReadings(
        startDate: Date | null,
        endDate: Date | null,
        excludeStartDate: boolean | null = false,
        excludeEndDate: boolean | null = false,
        bucketIntervalMs: number | null = null,
        bucketOffsetDate: Date | null = null
    ): Promise<SensorReading[]> {
        
        if (!startDate) startDate = await this.getMinCreatedAt() ?? new Date(0);
        if (!endDate) endDate = await this.getMaxCreatedAt() ?? new Date();
        if (startDate > endDate) throw new Error("Start date cannot be after end date");
        
        let query = this.database
            .selectFrom(Esp32DatabaseTableNames.SensorReadings)
            .selectAll()
        ;
        query = (
            excludeStartDate ? query.where("createdAt", ">", startDate.toISOString())
            : query.where("createdAt", ">=", startDate.toISOString())
        );
        query = (
            excludeEndDate ? query.where("createdAt", "<", endDate.toISOString())
            : query.where("createdAt", "<=", endDate.toISOString())
        );
        query = query.orderBy("createdAt", "asc");
        const rows: SensorReadingRow[] = await query.execute();
        const sensorReadings = rows.map(Esp32SqliteService.convertSensorReadingRow);

        if (bucketIntervalMs === null && bucketOffsetDate === null)
            return sensorReadings;
        if (bucketIntervalMs === null) throw new Error(
            "Bucket interval ms cannot be null when bucket offset Date is given."
        );
        return this.getBucketedReadings(
            sensorReadings,
            Math.abs(bucketIntervalMs),
            bucketOffsetDate ? bucketOffsetDate : startDate
        );

    }
    
    public async getMaxCreatedAt(): Promise<Date | null> {

        const row = await this.database
            .selectFrom(Esp32DatabaseTableNames.SensorReadings)
            .select("createdAt")
            .orderBy("createdAt", "desc")
            .limit(1)
            .executeTakeFirst()
        ;
        return row?.createdAt ? new Date(row.createdAt) : null;

    }
    
    public async getMinCreatedAt(): Promise<Date | null> {

        const row = await this.database
            .selectFrom(Esp32DatabaseTableNames.SensorReadings)
            .select("createdAt")
            .orderBy("createdAt", "asc")
            .limit(1)
            .executeTakeFirst()
        ;
        return row?.createdAt ? new Date(row.createdAt) : null;

    }

    public async getSafetyLevels(
        readingType: SafetyLevelReadingType
    ): Promise<SafetyLevel[]> {
        
        return await this.database
            .selectFrom(Esp32DatabaseTableNames.SafetyLevels)
            .selectAll()
            .where("readingType", "==", readingType)
            .orderBy("threshold", "asc")
            .execute()
        ;

    }
    
    public async deleteReadings(
        startDate: Date,
        endDate: Date,
        excludeStartDate: boolean = false,
        excludeEndDate: boolean = false
    ): Promise<SensorReading[]> {
        
        let query = this.database
            .deleteFrom(Esp32DatabaseTableNames.SensorReadings)
            .where(
                "createdAt",
                excludeStartDate ? ">" : ">=",
                startDate.toISOString()
            )
            .where(
                "createdAt",
                excludeEndDate ? "<" : "<=",
                endDate.toISOString()
            )
            .returningAll()
        ;
        const deleted = (await query.execute()) as SensorReadingRow[];
        const formattedStartDate = formatDate(startDate, DATE_FORMAT);
        const formattedEndDate = formatDate(endDate, DATE_FORMAT);
        console.log(
            `✅ Deleted readings from ${formattedStartDate} to ${formattedEndDate}`
        );
        
        return deleted.map(Esp32SqliteService.convertSensorReadingRow);

    }
    
    public async resetDatabase(): Promise<void> {

        await this.database.deleteFrom(Esp32DatabaseTableNames.SensorReadings).execute();
        console.log("✅ Database reset");

    }

    private getBucketedReadings(
        sensorReadings: SensorReading[],
        bucketIntervalMs: number,
        bucketOffsetDate: Date
    ): SensorReading[] {

        if (bucketIntervalMs === 0)
            throw new Error("Bucket interval ms cannot be 0");
        const buckets = new Map<number, SensortReadingBucket>();
        const bucketOffsetMs = bucketOffsetDate.getTime();
        const bucketedSensorReadings: SensorReading[] = [];
        
        for (const { createdAt, temperatureC, humidity, gas } of sensorReadings) {

            const timestamp = DateUtils.bucket(createdAt, bucketIntervalMs, bucketOffsetMs);
            if (!buckets.has(timestamp))
                buckets.set(timestamp, { ...SENSOR_READING_BUCKET_TEMPLATE });
            const bucket = buckets.get(timestamp)!;
            bucket.temperatureC += temperatureC;
            bucket.humidity += humidity;
            bucket.gas += gas;
            bucket.readingsCount++;
            
        }
        for (let [timestamp, { temperatureC, humidity, gas, readingsCount }] of buckets) {

            const createdAt = new Date(timestamp);
            temperatureC /= readingsCount;
            humidity /= readingsCount;
            gas /= readingsCount;
            bucketedSensorReadings.push({ createdAt, temperatureC, humidity, gas });

        }

        return bucketedSensorReadings;

    }

}
