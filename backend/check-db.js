const database = require('./config/database');

async function checkTableStructure() {
    try {
        console.log('🔍 Vérification de la structure des tables...');
        
        // Vérifier la structure de la table parrains
        const [parrains] = await database.execute('DESCRIBE parrains');
        console.log('\n📋 Structure de la table parrains:');
        parrains.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
        });
        
        // Vérifier la structure de la table filleuls
        const [filleuls] = await database.execute('DESCRIBE filleuls');
        console.log('\n📋 Structure de la table filleuls:');
        filleuls.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
        });
        
        // Vérifier la structure de la table attributions
        const [attributions] = await database.execute('DESCRIBE attributions');
        console.log('\n📋 Structure de la table attributions:');
        attributions.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
        });
        
        // Lister toutes les tables
        const [tables] = await database.execute('SHOW TABLES');
        console.log('\n📦 Tables existantes dans la base de données:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

checkTableStructure();