import "dotenv/config"
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from "./schema"
import { createClient } from "@libsql/client";

const DB_URL = process.env.DB_URL
const NETWORK = process.env.NETWORK

export const db = (() => {
    if (NETWORK == "testnet") {
        console.log("Testnet db")
        const client = createClient({ url: DB_URL!, authToken: process.env.DB_TOKEN })
        return drizzle<typeof schema>({
            client,
            schema
        });
    }
    return drizzle<typeof schema>({ client: createClient({ url: 'local-store/sqlite/sqlite.db' }), schema });
})(); 
