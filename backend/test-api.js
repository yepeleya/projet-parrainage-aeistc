// Script de test pour vérifier l'API
const testData = {
    parrains: [
        {
            nom: "Martin",
            prenom: "Jean",
            email: "jean.martin@test.com",
            filiere: "EAIN"
        },
        {
            nom: "Dubois",
            prenom: "Marie",
            email: "marie.dubois@test.com",
            filiere: "EJ"
        }
    ],
    filleuls: [
        {
            nom: "Petit",
            prenom: "Pierre",
            email: "pierre.petit@test.com",
            filiere: "EAIN"
        },
        {
            nom: "Rousseau",
            prenom: "Sophie",
            email: "sophie.rousseau@test.com",
            filiere: "EJ"
        }
    ]
};

async function testAPI() {
    try {
        console.log('🧪 Test de l\'API /api/process-data...');
        
        const response = await fetch('http://localhost:5000/api/process-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ API Response:', result);
        
        // Test du health check
        const healthResponse = await fetch('http://localhost:5000/api/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData);
        
    } catch (error) {
        console.error('❌ API Test failed:', error);
    }
}

testAPI();