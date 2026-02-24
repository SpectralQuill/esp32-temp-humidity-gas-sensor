import { Esp32SqliteService } from "../src/sqliteService";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function resetDatabase() {

    let { DATABASE_PATH } = process.env;
    if (!DATABASE_PATH) throw new Error("DATABASE_PATH env variable not set");
    DATABASE_PATH = path.resolve(__dirname, "..", DATABASE_PATH);
    
    console.log("🚨 Resetting SQLite database...");

    console.log("🔧 Initializing service...");
    const sqliteService = new Esp32SqliteService();
    await sqliteService.initialize();
    console.log("✅ Service initialized");

    try {

        if(!fs.existsSync(DATABASE_PATH))
            throw new Error(`Database file not found at ${DATABASE_PATH}`);

        const stats = fs.statSync(DATABASE_PATH);
        console.log(`📁 Current database: ${DATABASE_PATH}`);
        console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
        console.log(`📅 Created: ${stats.birthtime.toLocaleString()}`);

        const backupPath = DATABASE_PATH + ".backup";
        fs.copyFileSync(DATABASE_PATH, backupPath);
        console.log(`💾 Backup created: ${backupPath}`);

        console.log("🔄 Resetting database...");
        await sqliteService.resetDatabase();
        console.log("✅ Database reset successful!");

    } catch (error) {

        console.error("❌ Error resetting database:", error);
        process.exit(1);

    } finally {

        await sqliteService.close();
        console.log("🔒 Service closed");

    }

}

if (process.argv[1] === fileURLToPath(import.meta.url))
    resetDatabase();
