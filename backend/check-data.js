const db = require('./config/database');

async function checkDatabase() {
    try {
        console.log('🔍 Vérification des données dans la base...\n');
        
        console.log('=== PARRAINS ===');
        const [parrains] = await db.execute('SELECT id, full_name, email, filiere, created_at FROM parrains ORDER BY created_at DESC LIMIT 10');
        console.table(parrains);
        
        console.log('\n=== FILLEULS ===');
        const [filleuls] = await db.execute('SELECT id, full_name, email, filiere, created_at FROM filleuls ORDER BY created_at DESC LIMIT 10');
        console.table(filleuls);
        
        console.log('\n=== ATTRIBUTIONS ===');
        const [attributions] = await db.execute('SELECT id, parrain_id, filleul_id, session_id, filiere, created_at FROM attributions ORDER BY created_at DESC LIMIT 10');
        console.table(attributions);
        
        console.log(`\n📊 Totaux:`);
        console.log(`   Parrains: ${parrains.length}`);
        console.log(`   Filleuls: ${filleuls.length}`);
        console.log(`   Attributions: ${attributions.length}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        process.exit();
    }
}

checkDatabase();