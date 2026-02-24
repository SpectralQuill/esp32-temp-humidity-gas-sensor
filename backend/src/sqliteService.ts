import {
    DatabaseSchema,
    Esp32KyselyClient
} from "./kyselyClient";
import { format as formatDate } from "date-fns";
import { Kysely } from "kysely";

const DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

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
    private tableName: string;

    public constructor() {

        const { API_SERVICE_NAME, DATABASE_TABLE_NAME } = process.env;
        if (!API_SERVICE_NAME) throw new Error("API_SERVICE_NAME env variable not set");
        if (!DATABASE_TABLE_NAME) throw new Error("DATABASE_TABLE_NAME env variable not set");
        this.serviceName = API_SERVICE_NAME;
        this.tableName = DATABASE_TABLE_NAME;

    }

    private get database(): Kysely<DatabaseSchema> {

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
        
        await this.database.insertInto(this.tableName).values(reading).execute();
        
        const formattedDate = formatDate(createdAt, DATE_FORMAT);
        console.log(
            `✅ Creating reading at ${formattedDate} - Temp: ${temperatureC}°C, Humidity: ${humidity}, Gas: ${gas}`
        );
        
        return { createdAt, temperatureC, humidity, gas };
        
    }
    
    public async getHealth(): Promise<Esp32ApiHealth> {

        const { tableName, serviceName } = this;
        try {

            const data = await this.database
                .selectFrom(tableName)
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
        excludeStartDate: boolean | null,
        excludeEndDate: boolean | null
    ): Promise<SensorReading[]> {
        
        if (!startDate) startDate = await this.getMinCreatedAt() ?? new Date(0);
        if (!endDate) endDate = await this.getMaxCreatedAt() ?? new Date();
        if (startDate > endDate) throw new Error("Start date cannot be after end date");
        
        let query = this.database.selectFrom(this.tableName).selectAll();
        query = (
            excludeStartDate ? query.where("createdAt", ">", startDate.toISOString())
            : query.where("createdAt", ">=", startDate.toISOString())
        );
        query = (
            excludeEndDate ? query.where("createdAt", "<", endDate.toISOString())
            : query.where("createdAt", "<=", endDate.toISOString())
        );
        query = query.orderBy("createdAt", "asc");
        const rows = await query.execute();
        
        return rows.map(Esp32SqliteService.convertSensorReadingRow);

    }
    
    public async getMaxCreatedAt(): Promise<Date | null> {

        const row = await this.database
            .selectFrom(this.tableName)
            .select("createdAt")
            .orderBy("createdAt", "desc")
            .limit(1)
            .executeTakeFirst()
        ;
        return row?.createdAt ? new Date(row.createdAt) : null;

    }
    
    public async getMinCreatedAt(): Promise<Date | null> {

        const row = await this.database
            .selectFrom(this.tableName)
            .select("createdAt")
            .orderBy("createdAt", "asc")
            .limit(1)
            .executeTakeFirst()
        ;
        return row?.createdAt ? new Date(row.createdAt) : null;

    }
    
    public async deleteReadings(
        startDate: Date,
        endDate: Date,
        excludeStartDate = false,
        excludeEndDate = false
    ): Promise<SensorReading[]> {
        
        let query = this.database
            .deleteFrom(this.tableName)
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
        const deleted = await query.execute();
        const formattedStartDate = formatDate(startDate, DATE_FORMAT);
        const formattedEndDate = formatDate(endDate, DATE_FORMAT);
        console.log(`✅ Deleted readings from ${formattedStartDate} to ${formattedEndDate}`);
        
        return deleted.map(Esp32SqliteService.convertSensorReadingRow);

    }
    
    public async resetDatabase(): Promise<void> {

        await this.database.deleteFrom(this.tableName).execute();
        console.log("✅ Database reset");

    }

}
