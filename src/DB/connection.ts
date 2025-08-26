import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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



export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(query, params);
    await connection.end();
    return result as T;
}
