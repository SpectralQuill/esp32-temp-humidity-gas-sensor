import { defineConfig } from "vite";
import dotenv from "dotenv";
import path from "path";
import react from "@vitejs/plugin-react";

dotenv.config({
    path: "../.env"
});

const { VITE_SERVER_HOST, VITE_SERVER_PORT } = process.env;

if (!VITE_SERVER_HOST || !VITE_SERVER_PORT)
    throw new Error(
        `Error: VITE_SERVER_HOST and VITE_SERVER_PORT is required in environmental variables`
    );

// https://vite.dev/config/
export default defineConfig({
    server: {
        host: VITE_SERVER_HOST,
        port: +VITE_SERVER_PORT
    },
    plugins: [react()],
    envDir: path.resolve(__dirname, "../")
});
