import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345678',
    database: process.env.DB_NAME || 'library1',
    charset: 'utf8mb4'
};




export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
    let retries = 5;
    while (retries > 0) {
        try {
            const connection = await mysql.createConnection(dbConfig);
            await connection.execute('SET NAMES utf8mb4');
            const [result] = await connection.execute(query, params);
            await connection.end();
            return result as T;
        } catch (error: any) {
            retries--;
            if (retries === 0) throw error;
            console.log(`Tentativa de conexão falhou, tentando novamente... (${retries} tentativas restantes)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    throw new Error('Falha ao conectar com o banco após várias tentativas');
}
