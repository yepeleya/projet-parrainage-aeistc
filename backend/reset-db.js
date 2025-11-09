const database = require('./config/database');

async function resetDatabase() {
    try {
        console.log('🗑️ Suppression de toutes les tables...');
        
        // Désactiver les contraintes de clés étrangères
        await database.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Supprimer les tables dans l'ordre pour éviter les erreurs de clés étrangères
        const tablesToDrop = [
            'v_attributions_completes',
            'attributions', 
            'parrains', 
            'filleuls', 
            'stats_cache',
            'migrations'
        ];
        
        for (const table of tablesToDrop) {
            try {
                await database.execute(`DROP TABLE IF EXISTS \`${table}\``);
                console.log(`✅ Table ${table} supprimée`);
            } catch (error) {
                console.log(`⚠️ Erreur suppression ${table}:`, error.message);
            }
        }
        
        // Réactiver les contraintes de clés étrangères
        await database.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        // Vérifier que toutes les tables sont supprimées
        const [tables] = await database.execute('SHOW TABLES');
        console.log('\n📦 Tables restantes:');
        if (tables.length === 0) {
            console.log('  ✅ Aucune table - base de données propre !');
        } else {
            tables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }
        
        console.log('\n🎉 Base de données nettoyée avec succès !');
        console.log('Maintenant exécutez: npm run migrate:fresh');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

resetDatabase();