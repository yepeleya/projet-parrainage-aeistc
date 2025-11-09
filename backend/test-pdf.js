const PDFGenerator = require('./utils/PDFGenerator');
const path = require('path');

async function testPDFGeneration() {
    try {
        console.log('🧪 Test de génération PDF...');
        
        const uploadsDir = path.join(__dirname, 'uploads');
        const pdfGenerator = new PDFGenerator(uploadsDir);
        
        // Données de test
        const testAttributions = [
            {
                parrain_name: "Sophie Larsson",
                parrain_email: "sophie.larsson@test.com",
                filleul_name: "Marie Tremblay",
                filleul_email: "marie.tremblay@test.com",
                filiere: "EJ"
            },
            {
                parrain_name: "Ahmed Benali", 
                parrain_email: "ahmed.benali@test.com",
                filleul_name: "Kevin Dubois",
                filleul_email: "kevin.dubois@test.com",
                filiere: "EJ"
            }
        ];
        
        console.log('📄 Génération du PDF avec les données de test...');
        const filename = await pdfGenerator.generateAttributionsPDF(testAttributions, "EJ", "test-session");
        
        console.log(`✅ PDF généré avec succès: ${filename}`);
        
    } catch (error) {
        console.error('❌ Erreur lors du test PDF:', error);
        
        if (error.message.includes('Could not find Chromium')) {
            console.log('💡 Solution: Installer Chromium pour Puppeteer');
            console.log('   Exécutez: npx puppeteer browsers install chrome');
        }
    }
}

testPDFGeneration();