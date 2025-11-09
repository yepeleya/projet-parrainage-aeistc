const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parrainage_db',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    timezone: '+00:00'
};

let connection = null;

const createConnection = async () => {
    try {
        if (!connection) {
            connection = await mysql.createConnection(dbConfig);
            console.log('✅ Database connected successfully');
            
            // Changer le collation vers utf8mb4_general_ci
            await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_general_ci');
            console.log('✅ Database charset set to utf8mb4_general_ci');
        }
        return connection;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

const closeConnection = async () => {
    if (connection) {
        await connection.end();
        connection = null;
        console.log('✅ Database connection closed');
    }
};

// Test de connexion
const testConnection = async () => {
    try {
        const conn = await createConnection();
        const [rows] = await conn.execute('SELECT 1 as test');
        console.log('✅ Database test successful:', rows[0]);
        return true;
    } catch (error) {
        console.error('❌ Database test failed:', error);
        return false;
    }
};

// Wrapper pour exposer les méthodes de la connexion directement
const database = {
    async execute(query, params) {
        const conn = await createConnection();
        return await conn.execute(query, params);
    },
    
    async beginTransaction() {
        const conn = await createConnection();
        return await conn.beginTransaction();
    },
    
    async commit() {
        const conn = await createConnection();
        return await conn.commit();
    },
    
    async rollback() {
        const conn = await createConnection();
        return await conn.rollback();
    },
    
    async getConnection() {
        return await createConnection();
    }
};

module.exports = database;

// Exporter aussi les utilitaires
module.exports.dbConfig = dbConfig;
module.exports.createConnection = createConnection;
module.exports.closeConnection = closeConnection;
module.exports.testConnection = testConnection;