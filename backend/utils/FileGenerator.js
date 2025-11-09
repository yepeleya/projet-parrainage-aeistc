const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const PDFGenerator = require('./PDFGenerator');

class FileGenerator {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../uploads');
        this.pdfGenerator = new PDFGenerator(this.uploadsDir);
    }

    // Fonction utilitaire pour nettoyer les noms de fichiers
    sanitizeFileName(str) {
        return str.replace(/[<>:"/\\|?*]/g, '_')
                 .replace(/\s+/g, '_')
                 .normalize("NFD")
                 .replace(/[\u0300-\u036f]/g, '');
    }

    // Génération du fichier Excel des parrains finaux
    async generateParrainsFile(parrains, sessionId, filiere) {
        try {
            const workbook = XLSX.utils.book_new();
            
            // Préparer les données pour Excel
            const excelData = parrains.map((parrain, index) => ({
                'N°': index + 1,
                'Nom Complet': parrain.full_name,
                'Email': parrain.email,
                'Filière': parrain.filiere,
                'Date Attribution': new Date().toLocaleDateString('fr-FR'),
                'Session ID': sessionId
            }));

            // Créer la feuille de calcul
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Ajuster la largeur des colonnes
            worksheet['!cols'] = [
                { width: 5 },   // N°
                { width: 25 },  // Nom Complet
                { width: 30 },  // Email
                { width: 10 },  // Filière
                { width: 15 },  // Date Attribution
                { width: 25 }   // Session ID
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Parrains');

            // Générer le nom de fichier
            const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '_');
            const fileName = `PARRAINS_FINAUX_${filiere}_${timestamp}.xlsx`;
            const filePath = path.join(this.uploadsDir, 'parrains', fileName);

            // Écrire le fichier
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            await fs.writeFile(filePath, buffer);

            console.log(`✅ Fichier parrains généré: ${fileName}`);
            return {
                success: true,
                fileName,
                filePath,
                count: parrains.length
            };

        } catch (error) {
            console.error('❌ Erreur génération fichier parrains:', error);
            throw error;
        }
    }

    // Génération du fichier Excel des filleuls finaux
    async generateFilleulsFile(filleuls, sessionId, filiere) {
        try {
            const workbook = XLSX.utils.book_new();
            
            // Préparer les données pour Excel
            const excelData = filleuls.map((filleul, index) => ({
                'N°': index + 1,
                'Nom Complet': filleul.full_name,
                'Email': filleul.email,
                'Filière': filleul.filiere,
                'Date Attribution': new Date().toLocaleDateString('fr-FR'),
                'Session ID': sessionId
            }));

            // Créer la feuille de calcul
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Ajuster la largeur des colonnes
            worksheet['!cols'] = [
                { width: 5 },   // N°
                { width: 25 },  // Nom Complet
                { width: 30 },  // Email
                { width: 10 },  // Filière
                { width: 15 },  // Date Attribution
                { width: 25 }   // Session ID
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Filleuls');

            // Générer le nom de fichier
            const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '_');
            const fileName = `FILLEULS_FINAUX_${filiere}_${timestamp}.xlsx`;
            const filePath = path.join(this.uploadsDir, 'filleuls', fileName);

            // Écrire le fichier
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            await fs.writeFile(filePath, buffer);

            console.log(`✅ Fichier filleuls généré: ${fileName}`);
            return {
                success: true,
                fileName,
                filePath,
                count: filleuls.length
            };

        } catch (error) {
            console.error('❌ Erreur génération fichier filleuls:', error);
            throw error;
        }
    }

    // Génération du fichier Excel des attributions finales
    async generateAttributionsFile(attributions, sessionId, filiere) {
        try {
            const workbook = XLSX.utils.book_new();
            
            // Préparer les données pour Excel avec toutes les paires parrain-filleul
            const excelData = [];
            let counter = 1;

            attributions.forEach(attribution => {
                excelData.push({
                    'N°': counter++,
                    'Nom Parrain': attribution.parrain_name,
                    'Email Parrain': attribution.parrain_email || 'N/A',
                    'Nom Filleul': attribution.filleul_name,
                    'Email Filleul': attribution.filleul_email || 'N/A',
                    'Filière': attribution.filiere,
                    'Date Attribution': new Date().toLocaleDateString('fr-FR'),
                    'Session ID': sessionId
                });
            });

            // Créer la feuille de calcul
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Ajuster la largeur des colonnes
            worksheet['!cols'] = [
                { width: 5 },   // N°
                { width: 25 },  // Nom Parrain
                { width: 30 },  // Email Parrain
                { width: 25 },  // Nom Filleul
                { width: 30 },  // Email Filleul
                { width: 10 },  // Filière
                { width: 15 },  // Date Attribution
                { width: 25 }   // Session ID
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Attributions');

            // Générer le nom de fichier
            const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '_');
            const fileName = `ATTRIBUTIONS_FINALES_${filiere}_${timestamp}.xlsx`;
            const filePath = path.join(this.uploadsDir, 'attributions', fileName);

            // Écrire le fichier
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            await fs.writeFile(filePath, buffer);

            console.log(`✅ Fichier attributions généré: ${fileName}`);
            return {
                success: true,
                fileName,
                filePath,
                count: attributions.length
            };

        } catch (error) {
            console.error('❌ Erreur génération fichier attributions:', error);
            throw error;
        }
    }

    // Génération de tous les fichiers après attribution
    async generateAllFiles(parrains, filleuls, attributions, sessionId, filiere) {
        try {
            console.log(`🔄 Génération des fichiers finaux pour la session ${sessionId}`);

            const results = await Promise.all([
                this.generateParrainsFile(parrains, sessionId, filiere),
                this.generateFilleulsFile(filleuls, sessionId, filiere),
                this.generateAttributionsFile(attributions, sessionId, filiere),
                this.generateAttributionsPDF(attributions, sessionId, filiere)
            ]);

            const summary = {
                success: true,
                sessionId,
                filiere,
                files: {
                    parrains: results[0],
                    filleuls: results[1],
                    attributions: results[2],
                    pdf: results[3]
                },
                generatedAt: new Date().toISOString()
            };

            console.log(`✅ Tous les fichiers générés avec succès pour ${filiere}`);
            return summary;

        } catch (error) {
            console.error('❌ Erreur lors de la génération des fichiers:', error);
            throw error;
        }
    }

    // Génération du PDF des attributions
    async generateAttributionsPDF(attributions, sessionId, filiere) {
        try {
            // Récupérer les données complètes des attributions depuis la base de données
            const database = require('../config/database');
            const [rows] = await database.execute(`
                SELECT 
                    p.full_name as parrain_name,
                    p.email as parrain_email,
                    f.full_name as filleul_name,
                    f.email as filleul_email,
                    a.attribution_date,
                    a.filiere
                FROM attributions a
                JOIN parrains p ON a.parrain_id = p.id
                JOIN filleuls f ON a.filleul_id = f.id
                WHERE a.session_id = ? AND a.filiere = ?
                ORDER BY p.full_name, f.full_name
            `, [sessionId, filiere]);

            // Générer le PDF
            const filename = await this.pdfGenerator.generateAttributionsPDF(rows, filiere);
            
            return filename;
        } catch (error) {
            console.error('❌ Erreur lors de la génération du PDF:', error);
            throw error;
        }
    }

    // Lister les fichiers disponibles
    async listFiles(type = 'all') {
        try {
            const results = {};

            if (type === 'all' || type === 'parrains') {
                const parrainFiles = await fs.readdir(path.join(this.uploadsDir, 'parrains'));
                results.parrains = parrainFiles.filter(file => file.endsWith('.xlsx'));
            }

            if (type === 'all' || type === 'filleuls') {
                const filleulFiles = await fs.readdir(path.join(this.uploadsDir, 'filleuls'));
                results.filleuls = filleulFiles.filter(file => file.endsWith('.xlsx'));
            }

            if (type === 'all' || type === 'attributions') {
                const attributionFiles = await fs.readdir(path.join(this.uploadsDir, 'attributions'));
                results.attributions = attributionFiles.filter(file => file.endsWith('.xlsx'));
            }

            if (type === 'all' || type === 'pdfs') {
                const pdfFiles = await fs.readdir(path.join(this.uploadsDir, 'pdfs'));
                results.pdfs = pdfFiles.filter(file => file.endsWith('.pdf'));
            }

            return results;

        } catch (error) {
            console.error('❌ Erreur lors de la liste des fichiers:', error);
            throw error;
        }
    }
}

module.exports = FileGenerator;