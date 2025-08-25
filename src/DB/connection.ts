import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: '172.23.0.2',
    port: 3306,
    user: 'root',
    password: '12345678',
    database: 'library1'
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
