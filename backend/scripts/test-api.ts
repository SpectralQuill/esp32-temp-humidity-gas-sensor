#!/usr/bin/env tsx

import { sensorDB } from "../src/database";

async function testAPI() {
    console.log("🧪 Testing Database API Methods...\n");

    try {
        await sensorDB.initialize();

        // Test 1: createReading
        console.log("1️⃣ Testing createReading...");
        const reading1 = await sensorDB.createReading(
            new Date("2024-01-15T10:00:00Z"),
            "temperature_c",
            25.5,
        );
        console.log("✅ Created:", reading1);

        // Test 2: createReadings
        console.log("\n2️⃣ Testing createReadings...");
        const batchResult = await sensorDB.createReadings(
            {
                createdAt: new Date("2024-01-15T10:05:00Z"),
                readingType: "temperature_c",
                value: 26.0,
            },
            {
                createdAt: new Date("2024-01-15T10:05:00Z"),
                readingType: "humidity",
                value: 65.0,
            },
            {
                createdAt: new Date("2024-01-15T10:05:00Z"),
                readingType: "gas",
                value: 42.0,
            },
        );
        console.log("✅ Batch created:", batchResult);

        // Test 3: getReadings
        console.log("\n3️⃣ Testing getReadings...");
        const startDate = new Date("2024-01-15T00:00:00Z");
        const endDate = new Date("2024-01-16T00:00:00Z");
        const allReadings = await sensorDB.getReadings(startDate, endDate);
        console.log(
            `✅ Found: ${allReadings.temperaturesC.length} temps, ${allReadings.humidities.length} humidity, ${allReadings.gases.length} gas`,
        );

        // Test 4: getTemperaturesC
        console.log("\n4️⃣ Testing getTemperaturesC...");
        const temps = await sensorDB.getTemperaturesC(startDate, endDate);
        console.log(`✅ Found ${temps.length} temperature readings`);

        // Test 5: getHumidities
        console.log("\n5️⃣ Testing getHumidities...");
        const humidities = await sensorDB.getHumidities(startDate, endDate);
        console.log(`✅ Found ${humidities.length} humidity readings`);

        // Test 6: getGases
        console.log("\n6️⃣ Testing getGases...");
        const gases = await sensorDB.getGases(startDate, endDate);
        console.log(`✅ Found ${gases.length} gas readings`);

        // Test 7: getLatestReadings
        console.log("\n7️⃣ Testing getLatestReadings...");
        const latest = await sensorDB.getLatestReadings();
        console.log("✅ Latest readings:", latest);

        // Test 9: deleteReadings (with startDate)
        console.log("\n9️⃣ Testing deleteReadings (with startDate)...");
        const deleteStart = new Date("2024-01-15T10:04:00Z");
        const deleteEnd = new Date("2024-01-15T10:06:00Z");
        const deleted1 = await sensorDB.deleteReadings(deleteStart, deleteEnd);
        console.log(`✅ Deleted ${deleted1.length} readings`);

        // Test 10: deleteReadings (without startDate - uses earliest)
        console.log("\n🔟 Testing deleteReadings (without startDate)...");
        const deleteEnd2 = new Date("2024-01-16T00:00:00Z");
        const deleted2 = await sensorDB.deleteReadings(null, deleteEnd2);
        console.log(`✅ Deleted ${deleted2.length} readings (all remaining)`);

        console.log("\n🎉 All tests passed!");
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    } finally {
        await sensorDB.close();
    }
}

testAPI();
