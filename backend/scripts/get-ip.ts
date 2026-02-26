import { IpAddressUtils } from "../utils/IpAddressUtils";

const ipv4Address: string | null = IpAddressUtils.getLocalIpAddress();

console.log(
    "Your IPv4 address on current WLAN connection is:", 
    ipv4Address ? ipv4Address : "Unknown"
);
