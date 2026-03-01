import { IpAddressUtils } from "../utils/IpAddressUtils";

const ipv4Address: string = IpAddressUtils.getLocalIpAddress() ?? "Unknown";

console.log(`Your IPv4 address on current WLAN connection is:\n` + ipv4Address);
