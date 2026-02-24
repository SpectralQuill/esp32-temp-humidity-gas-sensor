import fs from "fs";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import {
    Kysely,
    sql,
    SqliteDialect
} from "kysely";
import path from "path";

dotenv.config();

const { DATABASE_TABLE_NAME } = process.env;
if (!DATABASE_TABLE_NAME) throw new Error("DATABASE_TABLE_NAME env variable not set");

export interface DatabaseSchema {
    [DATABASE_TABLE_NAME]: SensorReadingRow;
}

export class Esp32KyselyClient {

    private readonly database: Kysely<DatabaseSchema>;

    public constructor() {

        const { DATABASE_PATH } = process.env;
        if (!DATABASE_PATH) throw new Error("DATABASE_PATH env variable not set");

        const dir = path.dirname(DATABASE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const sqlite = new Database(DATABASE_PATH);
        this.database = new Kysely<DatabaseSchema>({
            dialect: new SqliteDialect({
                database: sqlite
            })
        });

    }

    public get connection(): Kysely<DatabaseSchema> {

        return this.database;

    }

    public async initialize(): Promise<void> {

        await this.database.schema
            .createTable("sensor_readings")
            .ifNotExists()
            .addColumn("createdAt", "text", col =>
                col.notNull().primaryKey()
            )
            .addColumn("temperatureC", "real", col =>
                col.notNull()
            )
            .addColumn("humidity", "real", col =>
                col.notNull()
            )
            .addColumn("gas", "real", col =>
                col.notNull()
            )
            .addCheckConstraint(
                "temperature_precision",
                sql`ROUND(temperatureC, 1) = temperatureC`
            )
            .addCheckConstraint(
                "humidity_range",
                sql`humidity >= 0 AND humidity <= 1 AND ROUND(humidity, 2) = humidity`
            )
            .addCheckConstraint(
                "gas_range",
                sql`gas >= 0 AND gas <= 1 AND ROUND(gas, 2) = gas`
            )
            .execute();
    }

    public async destroy(): Promise<void> {
        await this.database.destroy();
    }

}
