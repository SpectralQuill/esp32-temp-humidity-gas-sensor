import "../scripts/set-env";

import { execSync } from "child_process";
import os from "os";

export class IpAddressUtils {
    
    public static getLocalIpAddress(): string | null {

        const ssid = process.env.WIFI_SSID;
        if (!ssid) return null;

        try {

            let wifiInterfaceName: string | null = null;

            if (process.platform === "win32") {
                // Get netsh wlan interfaces output
                const output = execSync("netsh wlan show interfaces", { encoding: "utf8" });
                const lines = output.split("\n");

                // Find the interface connected to our SSID
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith("Name") && trimmed.includes("Wi-Fi")) {
                        wifiInterfaceName = trimmed.split(":")[1].trim();
                    }
                    if (trimmed.startsWith("SSID") && trimmed.includes(ssid)) {
                        break; // stop when we confirm we're on correct SSID
                    }
                }

                if (!wifiInterfaceName) return null;

                // Match the network interface in os.networkInterfaces()
                const interfaces = os.networkInterfaces();
                for (const [name, addrs] of Object.entries(interfaces)) {
                    if (name === wifiInterfaceName && addrs) {
                        for (const { family, address, internal } of addrs) {
                            if (family === "IPv4" && !internal) return address;
                        }
                    }
                }

            } else {

                // macOS / Linux
                const iface = execSync("iw dev | grep Interface | awk '{print $2}'", { encoding: "utf8" }).trim();
                const outputSSID = execSync(`iw dev ${iface} link | grep SSID | awk '{print $2}'`, { encoding: "utf8" }).trim();

                if (outputSSID === ssid) {
                    const interfaces = os.networkInterfaces();
                    for (const [name, addrs] of Object.entries(interfaces)) {
                        if (name === iface && addrs) {
                            for (const { family, address, internal } of addrs) {
                                if (family === "IPv4" && !internal) return address;
                            }
                        }
                    }
                }

            }

        } catch (err) {

            console.error("Failed to retrieve WiFi IP:", err);
            
        }

        return null;

    }

    public static isAllZeroesAddress(address: string): boolean {

        return (address === "0.0.0.0");
    
    }
    
}
