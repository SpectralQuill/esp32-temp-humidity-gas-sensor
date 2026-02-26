export const ESP32_FRONTEND_ENV_SCHEMA_DATA = [
    { name: "VITE_API_HOST", type: "string" },
    { name: "VITE_API_PORT", type: "string" },
    { name: "VITE_API_CONNECTION_INTERVAL_MS", type: "number" },
    { name: "VITE_API_MAX_CONNECTION_COUNT", type: "number" },
    { name: "VITE_API_CONNECTION_IS_SIMULATED", type: "boolean" },
    { name: "VITE_GRAPH_REFRESH_INTERVAL_MS", type: "number" }
] as const satisfies ReadonlyArray<EnvSchema>;
