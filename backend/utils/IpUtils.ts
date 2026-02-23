import os from "os";

export class IpUtils {
    
    public static getLocalIpAddress(): string | null {
        
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            const addresses = interfaces[name];
            if (!addresses) continue;
            for (const { family, address, internal } of addresses)
                if (family === "IPv4" && !internal)
                    return address;
        }
        return null;

    }

    public static isAllZeroesAddress(address: string): boolean {

        return (address === "0.0.0.0");
    
    }
    
}
