const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function forceMigrations() {
    try {
        console.log('🔄 Starting forced migration...');
        
        // Vider la table migrations
        await db.execute('DELETE FROM migrations');
        console.log('🗑️ Cleared migrations table');
        
        // Lire et exécuter chaque fichier de migration
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
            
        for (const file of files) {
            console.log(`\n📄 Processing ${file}...`);
            
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            
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

            console.log(`📝 Found ${statements.length} statements`);
            
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                
                if (statement.trim() === '') {
                    continue;
                }
                
                try {
                    console.log(`  ▶️ Executing statement ${i + 1}: ${statement.substring(0, 50)}...`);
                    await db.execute(statement);
                    console.log(`  ✅ Statement ${i + 1} executed successfully`);
                } catch (error) {
                    console.error(`❌ Error in statement ${i + 1}:`, error.message);
                    console.error(`Statement: ${statement}`);
                    throw error;
                }
            }
            
            // Enregistrer la migration comme exécutée
            await db.execute(
                'INSERT INTO migrations (filename, executed_at) VALUES (?, NOW())',
                [file]
            );
            console.log(`✅ Migration ${file} completed and recorded`);
        }
        
        console.log('\n🎉 All migrations completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        process.exit();
    }
}

forceMigrations();