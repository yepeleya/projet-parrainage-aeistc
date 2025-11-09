const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFGenerator {
    constructor(uploadsDir) {
        this.uploadsDir = uploadsDir;
        this.pdfsDir = path.join(uploadsDir, 'pdfs');
    }

    async generateAttributionsPDF(attributions, filiere) {
        try {
            // Créer le dossier pdfs s'il n'existe pas
            await fs.mkdir(this.pdfsDir, { recursive: true });

            // Générer le nom du fichier
            const timestamp = new Date().toISOString()
                .replace(/:/g, '_')
                .replace(/\..+/, '')
                .replace('T', '_');
            const filename = `ATTRIBUTIONS_${filiere}_${timestamp}.pdf`;
            const filepath = path.join(this.pdfsDir, filename);

            // Créer le contenu HTML
            const htmlContent = this.generateHTML(attributions, filiere);

            // Générer le PDF avec Puppeteer
            const browser = await puppeteer.launch({ 
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            await page.pdf({
                path: filepath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();

            console.log(`✅ PDF généré: ${filename}`);
            return filename;

        } catch (error) {
            console.error('❌ Erreur lors de la génération PDF:', error);
            throw error;
        }
    }

    generateHTML(attributions, filiere) {
        const currentDate = new Date().toLocaleDateString('fr-FR');
        
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attributions ${filiere}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        
        .attribution-list {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .attribution-item {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }
        
        .attribution-item:last-child {
            border-bottom: none;
        }
        
        .attribution-item:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .parrain {
            flex: 1;
            padding-right: 20px;
        }
        
        .arrow {
            color: #667eea;
            font-size: 20px;
            margin: 0 15px;
        }
        
        .filleul {
            flex: 1;
            padding-left: 20px;
        }
        
        .person-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 3px;
        }
        
        .person-email {
            font-size: 12px;
            color: #666;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
        
        @media print {
            body {
                background-color: white;
            }
            
            .attribution-list {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Attributions de Parrainage - ${filiere}</h1>
        <p>Généré le ${currentDate} | AEISTC</p>
    </div>
    
    <div class="stats">
        <div class="stat-item">
            <div class="stat-value">${attributions.length}</div>
            <div class="stat-label">Attributions</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${new Set(attributions.map(a => a.parrain_name)).size}</div>
            <div class="stat-label">Parrains</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${new Set(attributions.map(a => a.filleul_name)).size}</div>
            <div class="stat-label">Filleuls</div>
        </div>
    </div>
    
    <div class="attribution-list">
        ${attributions.map((attribution) => `
            <div class="attribution-item">
                <div class="parrain">
                    <div class="person-name">🧑‍🎓 ${attribution.parrain_name}</div>
                    <div class="person-email">${attribution.parrain_email || 'Email non disponible'}</div>
                </div>
                <div class="arrow">→</div>
                <div class="filleul">
                    <div class="person-name">🎓 ${attribution.filleul_name}</div>
                    <div class="person-email">${attribution.filleul_email || 'Email non disponible'}</div>
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="footer">
        <p>Document généré automatiquement par le système de parrainage AEISTC</p>
        <p>Association des Étudiants Ingénieurs Stagiaires Tunisiens du Canada</p>
    </div>
</body>
</html>`;
    }
}

module.exports = PDFGenerator;