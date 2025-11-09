const database = require('./config/database');

async function listTables() {
    try {
        console.log('📦 Listing all tables in database...');
        
        const [tables] = await database.execute('SHOW TABLES');
        console.log('\n📋 Tables existantes:');
        if (tables.length === 0) {
            console.log('  ❌ Aucune table trouvée !');
        } else {
            tables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

listTables();