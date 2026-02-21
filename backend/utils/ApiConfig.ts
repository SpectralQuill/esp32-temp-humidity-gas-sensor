export class ApiConfig {

    private host: string;
    private port: number;

    public constructor(host?: string, port?: string | number) {

        const isValidHost = (host !== undefined);
        const isValidPort = (port !== undefined) && !isNaN(Number(port));
        
        if (!isValidHost || !isValidPort)
            throw new Error("Invalid API configuration: host and port must be defined.");

        this.host = host;
        this.port = Number(port);

    }

    public getBaseUrl(): string {

        return `http://${this.host}:${this.port}`;
    
    }

    public getHost(): string {

        return this.host;
    
    }

    public getPort(): number {

        return this.port;

    }

}
