const database = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class MigrationManager {
    constructor() {
        this.connection = null;
        this.migrationsTable = 'migrations';
    }

    async init() {
        this.connection = await database.getConnection();
        await this.createMigrationsTable();
    }

    async createMigrationsTable() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `;
        
        await this.connection.execute(createTableSQL);
        console.log('✅ Migrations table ready');
    }

    async getExecutedMigrations() {
        const [rows] = await this.connection.execute(
            `SELECT filename FROM ${this.migrationsTable} ORDER BY executed_at`
        );
        return rows.map(row => row.filename);
    }

    async getMigrationFiles() {
        const migrationsDir = __dirname;
        const files = await fs.readdir(migrationsDir);
        return files
            .filter(file => file.endsWith('.sql') && file !== 'migrate.js')
            .sort();
    }

    async executeMigration(filename) {
        const filePath = path.join(__dirname, filename);
        const sql = await fs.readFile(filePath, 'utf8');
        
        // Nettoyer le contenu SQL - supprimer les commentaires
        const cleanedSql = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .filter(line => line.trim() !== '')
            .join('\n');

        // Diviser le contenu en instructions SQL séparées
        const statements = cleanedSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`📄 Executing migration: ${filename}`);
        console.log(`📝 Found ${statements.length} statements to execute`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            if (statement.trim() === '') {
                continue;
            }
            
            try {
                console.log(`  ▶️ Executing statement ${i + 1}/${statements.length}`);
                await this.connection.execute(statement);
                console.log(`  ✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                console.error(`❌ Error in statement ${i + 1}: ${statement.substring(0, 100)}...`);
                throw error;
            }
        }

        // Enregistrer la migration comme exécutée
        await this.connection.execute(
            `INSERT INTO ${this.migrationsTable} (filename) VALUES (?)`,
            [filename]
        );

        console.log(`✅ Migration ${filename} executed successfully`);
    }

    async runMigrations(fresh = false) {
        await this.init();

        if (fresh) {
            console.log('🔄 Running fresh migrations (dropping all tables)...');
            await this.dropAllTables();
            await this.connection.execute(`TRUNCATE TABLE ${this.migrationsTable}`);
        }

        const executedMigrations = await this.getExecutedMigrations();
        const migrationFiles = await this.getMigrationFiles();

        const pendingMigrations = migrationFiles.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`📦 Found ${pendingMigrations.length} pending migrations`);

        for (const migration of pendingMigrations) {
            await this.executeMigration(migration);
        }

        console.log('🎉 All migrations completed successfully!');
    }

    async dropAllTables() {
        const [tables] = await this.connection.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name != 'migrations'"
        );
        
        // Désactiver les contraintes de clés étrangères
        await this.connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        for (const table of tables) {
            await this.connection.execute(`DROP TABLE IF EXISTS \`${table.table_name}\``);
            console.log(`🗑️ Dropped table: ${table.table_name}`);
        }
        
        // Réactiver les contraintes de clés étrangères
        await this.connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    }
}

// CLI Runner
if (require.main === module) {
    const fresh = process.argv.includes('--fresh');
    const migrationManager = new MigrationManager();
    
    migrationManager.runMigrations(fresh)
        .then(() => {
            console.log('✅ Migration process completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = MigrationManager;