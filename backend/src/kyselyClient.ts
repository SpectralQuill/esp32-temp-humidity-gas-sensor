import "../scripts/set-env";

import Database from "better-sqlite3";
import fs from "fs";
import {
    Kysely,
    sql,
    SqliteDialect
} from "kysely";
import { SAFETY_LEVELS_SEED_DATA } from "./safetyLevels";
import path from "path";

export enum Esp32DatabaseTableNames {
    SensorReadings = "sensor_readings",
    SafetyLevels = "safety_levels"
}

export type Esp32DatabaseTableName = typeof Esp32DatabaseTableNames[
    keyof typeof Esp32DatabaseTableNames
];

export interface Esp32DatabaseSchema {
    [Esp32DatabaseTableNames.SensorReadings]: SensorReadingRow;
    [Esp32DatabaseTableNames.SafetyLevels]: SafetyLevelRow
}

export class Esp32KyselyClient {

    private database: Kysely<Esp32DatabaseSchema> | null = null;

    public get connection(): Kysely<Esp32DatabaseSchema> {

        const { database } = this;
        if (!database) throw new Error("Kysely client has not been initialized");
        return database;

    }

    public async initialize(): Promise<void> {

        const databasePath = this.ensureDatabasePath();
        const sqlite = new Database(databasePath);
        const database = new Kysely<Esp32DatabaseSchema>({
            dialect: new SqliteDialect({ database: sqlite })
        });

        await this.setSensorReadingsSchema(database);
        await this.setSafetyLevelsSchema(database);
        await this.ensureSafetyLevelsSeed(database);

        this.database = database;

        console.log("✅ Database initialized successfully.");

    }

    public async destroy(): Promise<void> {

        const { database } = this;
        if (!database ) throw new Error("Kysely client has not been initialized");
        await database.destroy();

    }

    private ensureDatabasePath(): string {
        
        const { DATABASE_PATH } = process.env;
        if (!DATABASE_PATH) throw new Error("DATABASE_PATH env variable not set");
        const dir = path.dirname(DATABASE_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        return DATABASE_PATH;

    }

    private async setSensorReadingsSchema(
        database: Kysely<Esp32DatabaseSchema>
    ): Promise<void> {

        await database.schema
            .createTable(Esp32DatabaseTableNames.SensorReadings)
            .ifNotExists()
            .addColumn("createdAt", "text", col => col.notNull().primaryKey())
            .addColumn("temperatureC", "real", col => col.notNull())
            .addColumn("humidity", "real", col => col.notNull())
            .addColumn("gas", "real", col => col.notNull())
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
            .execute()
        ;

    }

    private async setSafetyLevelsSchema(
        database: Kysely<Esp32DatabaseSchema>
    ): Promise<void> {

        await database.schema
            .createTable(Esp32DatabaseTableNames.SafetyLevels)
            .ifNotExists()
            .addColumn("readingType", "text", col => col.notNull())
            .addColumn("label", "text", col => col.notNull())
            .addColumn("threshold", "real", col => col.notNull())
            .addColumn("color", "text", col => col.notNull())
            .addColumn("level", "text", col => col.notNull())
            .addPrimaryKeyConstraint(
                "pk_safety_levels",
                ["readingType", "label"]
            )
            .addCheckConstraint(
                "threshold_precision",
                sql`ROUND(threshold, 2) = threshold`
            )
            .execute()
        ;

    }

    private async ensureSafetyLevelsSeed(
        database: Kysely<Esp32DatabaseSchema>
    ): Promise<void> {

        const existing = await database
            .selectFrom(Esp32DatabaseTableNames.SafetyLevels)
            .select(({ fn }) => fn.countAll().as("count"))
            .executeTakeFirst();
        const count = Number(existing?.count ?? 0);
        if (count > 0) return;

        for (const row of SAFETY_LEVELS_SEED_DATA)
            await database
                .insertInto(Esp32DatabaseTableNames.SafetyLevels)
                .values(row)
                .onConflict(onConflict =>
                    onConflict.columns(["readingType", "label"]).doUpdateSet({
                        threshold: row.threshold,
                        color: row.color,
                        level: row.level
                    })
                )
                .execute()
            ;
    
    }

}
