// linear-regression.ts
import * as fs from "fs";
import * as path from "path";

interface DataPoint {
    x: number;
    y: number;
}

interface RegressionResult {
    slope: number;
    intercept: number;
    rSquared: number;
    formula: string;
}

class LinearRegression {
    static calculate(data: DataPoint[]): RegressionResult {
        const n = data.length;

        // Calculate sums
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        let sumYY = 0;

        for (const point of data) {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumXX += point.x * point.x;
            sumYY += point.y * point.y;
        }

        // Calculate slope (m) and intercept (b)
        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        // Calculate R-squared
        const ssRes = data.reduce((acc, point) => {
            const predicted = m * point.x + b;
            return acc + Math.pow(point.y - predicted, 2);
        }, 0);

        const ssTot = data.reduce((acc, point) => {
            const meanY = sumY / n;
            return acc + Math.pow(point.y - meanY, 2);
        }, 0);

        const rSquared = 1 - ssRes / ssTot;

        return {
            slope: m,
            intercept: b,
            rSquared,
            formula: `y = ${m.toFixed(4)}x ${b >= 0 ? "+" : ""}${b.toFixed(4)}`,
        };
    }
}

class CSVReader {
    static parseFile(filePath: string): DataPoint[] {
        const data: DataPoint[] = [];

        try {
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Skip empty lines and header
                if (!line || i === 0) continue;

                // Handle different CSV formats
                const parts = line.split(/[,;\t]/).map((part) => part.trim());

                if (parts.length >= 2) {
                    const x = parseFloat(parts[0]);
                    const y = parseFloat(parts[1]);

                    if (!isNaN(x) && !isNaN(y)) {
                        data.push({ x, y });
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
        }

        return data;
    }
}

function analyzeCSV(filePath: string, xLabel: string, yLabel: string): void {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Analyzing: ${path.basename(filePath)}`);
    console.log(`X: ${xLabel}, Y: ${yLabel}`);
    console.log(`${"=".repeat(60)}`);

    const data = CSVReader.parseFile(filePath);

    if (data.length === 0) {
        console.log(`No valid data found in ${filePath}`);
        return;
    }

    console.log(`Data points: ${data.length}`);

    // Show first 5 data points
    console.log("\nFirst 5 data points:");
    for (let i = 0; i < Math.min(5, data.length); i++) {
        console.log(`  (${data[i].x}, ${data[i].y})`);
    }

    // Calculate regression
    const result = LinearRegression.calculate(data);

    // Display results
    console.log("\nLinear Regression Results:");
    console.log(`  Formula: ${result.formula}`);
    console.log(`  Slope (m): ${result.slope.toFixed(6)}`);
    console.log(`  Intercept (b): ${result.intercept.toFixed(6)}`);
    console.log(`  R-squared: ${result.rSquared.toFixed(6)}`);

    // Show some predictions
    if (data.length > 0) {
        console.log("\nSample predictions:");
        const minX = Math.min(...data.map((p) => p.x));
        const maxX = Math.max(...data.map((p) => p.x));

        const samplePoints = [minX, (minX + maxX) / 2, maxX];

        for (const x of samplePoints) {
            const y = result.slope * x + result.intercept;
            console.log(`  When x = ${x.toFixed(2)}, y ≈ ${y.toFixed(2)}`);
        }
    }
}

function main(): void {
    console.log("📈 Linear Regression Analysis");
    console.log("=".repeat(60));

    const files = [
        {
            path: "data/analog_to_percentage.csv",
            xLabel: "Analog",
            yLabel: "Percentage",
        },
        {
            path: "data/analog_to_temp_c.csv",
            xLabel: "Analog",
            yLabel: "Temp_C",
        },
    ];

    // Check if files exist
    for (const file of files) {
        if (!fs.existsSync(file.path)) {
            console.error(`\n❌ File not found: ${file.path}`);
            console.log(
                "Please ensure the CSV files are in the same directory.",
            );
            console.log("Expected format: x,y (one pair per line)");
            return;
        }
    }

    // Analyze each file
    for (const file of files) {
        analyzeCSV(file.path, file.xLabel, file.yLabel);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ Analysis complete!");
}

// Run the analysis
main();
