"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = executeQuery;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'library1'
};
console.log('Database config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
});
async function executeQuery(query, params = []) {
    const connection = await promise_1.default.createConnection(dbConfig);
    const [result] = await connection.execute(query, params);
    await connection.end();
    return result;
}
