import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Download, History, Users, Mail, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ParrainageApp.css';

// Configuration de l'API Backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com/api' 
    : '/api'; // Utilise le proxy en développement

// Fonctions utilitaires pour l'API
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
};

// Fonctions API spécifiques
const apiService = {
    // Health check
    healthCheck: () => apiRequest('/health'),
    
    // Envoyer toutes les données en une fois
    processData: (data) => apiRequest('/process-data', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    // Récupérer les statistiques
    getStats: () => apiRequest('/stats'),
    
    // Récupérer les parrains
    getParrains: () => apiRequest('/parrains'),
    
    // Récupérer les filleuls
    getFilleuls: () => apiRequest('/filleuls'),
    
    // Récupérer les attributions
    getAttributions: () => apiRequest('/attributions')
};

// Liste des filières disponibles à l'ISTC
const filieres = [
    { code: 'eain', name: 'EAIN', fullName: 'École des Arts et Images Numérique' },
    { code: 'ej', name: 'EJ', fullName: 'École de Journalisme' },
    { code: 'epa', name: 'EPA', fullName: 'École Production Audiovisuelle' },
    { code: 'epm', name: 'EPM', fullName: 'École Publicité Marketing' },
    { code: 'etta', name: 'ETTA', fullName: 'École de Télécommunication' }
];

const ParrainageApp = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedFiliere, setSelectedFiliere] = useState('');
    const [parrainsList, setParrainsList] = useState([]);
    const [filleulsList, setFilleulsList] = useState([]);
    const [attributions, setAttributions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [historique, setHistorique] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    // Fonction utilitaire pour nettoyer les caractères problématiques
    const cleanText = useCallback((text) => {
        if (!text) return '';
        return text
            .replace(/[ØßÜÊ¡²]/g, '') // Supprime les caractères problématiques spécifiques
            .replace(/&¡/g, '') // Supprime la séquence &¡
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
            .trim();
    }, []);

    // Hook pour détecter la taille d'écran
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fonction pour générer l'email académique
    const generateAcademicEmail = useCallback((fullName, filiere) => {
        const names = cleanText(fullName).trim().split(' ').filter(name => name.length > 1);
        if (names.length < 2) return null;
        
        const prenom = names[0].toLowerCase();
        const nom = names[1].toLowerCase();
        const filiereCode = filieres.find(f => f.name === filiere)?.code || 'gen';
        
        // Vérifier que le prénom et nom ont au moins 2 caractères
        if (prenom.length < 2 || nom.length < 2) return null;
        
        // Nettoyer les caractères spéciaux et problématiques
        const cleanPrenom = prenom
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
            .replace(/[ØßÜÊ¡²]/g, "") // Supprime les caractères problématiques spécifiques
            .replace(/[^a-z]/g, "") // Ne garde que les lettres minuscules
            .toLowerCase();
        
        const cleanNom = nom
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
            .replace(/[ØßÜÊ¡²]/g, "") // Supprime les caractères problématiques spécifiques
            .replace(/[^a-z]/g, "") // Ne garde que les lettres minuscules
            .toLowerCase();
        
        // Vérifier que les noms nettoyés ont encore une longueur suffisante
        if (cleanPrenom.length < 2 || cleanNom.length < 2) return null;
        
        return `${cleanPrenom}.${cleanNom}@edu.${filiereCode}.istc.ci`;
    }, [cleanText]);

    // Fonction pour traiter les fichiers Excel
    const handleFileUpload = useCallback((event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx')) {
            toast.error('Veuillez sélectionner un fichier .xlsx');
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Traiter les données (première colonne seulement)
                // Filtrer les en-têtes et les lignes vides
                const processedData = jsonData
                    .filter(row => {
                        if (!row[0] || !row[0].toString().trim()) return false;
                        
                        const cellValue = row[0].toString().trim().toUpperCase();
                        
                        // Exclure les en-têtes courants
                        const headers = [
                            'NOM & PRENOM',
                            'NOM ET PRENOM', 
                            'NOM PRENOM',
                            'NOMS ET PRENOMS',
                            'NOMS & PRENOMS',
                            'NOM',
                            'PRENOM',
                            'PRENOMS',
                            'PARRAIN',
                            'FILLEUL',
                            'LISTE',
                            'NAME',
                            'NAMES'
                        ];
                        
                        return !headers.includes(cellValue);
                    })
                    .map((row, index) => {
                        const fullName = cleanText(row[0].toString().trim());
                        const email = generateAcademicEmail(fullName, selectedFiliere);
                        
                        // Ne garder que les entrées avec un email valide (au moins 2 mots)
                        if (!email) return null;
                        
                        return {
                            id: index + 1,
                            fullName: fullName,
                            email: email
                        };
                    })
                    .filter(item => item !== null); // Supprimer les entrées nulles

                if (processedData.length === 0) {
                    toast.error('Aucune donnée valide trouvée dans le fichier. Vérifiez que les noms contiennent au moins un prénom et un nom.');
                    return;
                }

                // Compter les entrées totales vs filtrées
                const totalEntries = jsonData.filter(row => row[0] && row[0].toString().trim()).length;
                const filteredCount = totalEntries - processedData.length;
                
                if (type === 'parrains') {
                    setParrainsList(processedData);
                    let message = `${processedData.length} parrains importés avec succès`;
                    if (filteredCount > 0) {
                        message += ` (${filteredCount} entrée(s) filtrée(s))`;
                    }
                    toast.success(message);
                } else {
                    setFilleulsList(processedData);
                    let message = `${processedData.length} filleuls importés avec succès`;
                    if (filteredCount > 0) {
                        message += ` (${filteredCount} entrée(s) filtrée(s))`;
                    }
                    toast.success(message);
                }

            } catch (error) {
                toast.error('Erreur lors de la lecture du fichier');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    }, [selectedFiliere, generateAcademicEmail, cleanText]);

    // Fonction de mélange aléatoire (Fisher-Yates shuffle)
    const shuffleArray = useCallback((array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    // Fonction pour sauvegarder les données dans le backend
    const saveDataToBackend = useCallback(async (newAttributions) => {
        try {
            // Générer un ID de session unique
            const sessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Préparer les données pour l'API
            const dataToSend = {
                session_id: sessionId,
                parrains: parrainsList.map(parrain => ({
                    full_name: cleanText(parrain.fullName),
                    email: parrain.email,
                    filiere: selectedFiliere.toUpperCase()
                })),
                filleuls: filleulsList.map(filleul => ({
                    full_name: cleanText(filleul.fullName),
                    email: filleul.email,
                    filiere: selectedFiliere.toUpperCase()
                })),
                attributions: newAttributions.flatMap(attribution => 
                    attribution.parrains.map(parrain => ({
                        parrain_name: cleanText(parrain.fullName),
                        filleul_name: cleanText(attribution.filleul.fullName),
                        filiere: selectedFiliere.toUpperCase()
                    }))
                )
            };
            
            console.log('Envoi des données au backend:', dataToSend);
            
            // Envoyer les données à l'API
            const response = await apiService.processData(dataToSend);
            
            if (response.success) {
                console.log('✅ Données sauvegardées avec succès:', response);
                
                // Ajouter à l'historique local
                const historiqueEntry = {
                    id: sessionId,
                    date: new Date().toISOString(),
                    filiere: selectedFiliere.toUpperCase(),
                    parrains_count: parrainsList.length,
                    filleuls_count: filleulsList.length,
                    attributions_count: newAttributions.length
                };
                
                setHistorique(prev => [historiqueEntry, ...prev]);
            } else {
                throw new Error(response.message || 'Erreur lors de la sauvegarde');
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            toast.error(`Erreur de sauvegarde: ${error.message}`);
            // Ne pas empêcher la suite du processus
        }
    }, [parrainsList, filleulsList, selectedFiliere, cleanText]);

    // Algorithme de génération des attributions ALÉATOIRE ET ÉQUILIBRÉ
    const generateAttributions = useCallback(async () => {
        if (parrainsList.length === 0 || filleulsList.length === 0) {
            toast.error('Veuillez importer les listes de parrains et filleuls');
            return;
        }

        setLoading(true);
        
        try {
            const newAttributions = [];
            
            // Mélanger aléatoirement les listes pour garantir le caractère aléatoire
            const parrainsMelanges = shuffleArray(parrainsList);
            const filleulsMelanges = shuffleArray(filleulsList);

            if (parrainsMelanges.length >= filleulsMelanges.length) {
                // CAS 1: Plus de parrains que de filleuls
                // Distribuer les filleuls de façon aléatoire, certains filleuls auront 2 parrains
                
                let parrainIndex = 0;
                
                filleulsMelanges.forEach((filleul, filleulIndex) => {
                    const assignedParrains = [];
                    
                    // Premier parrain assigné aléatoirement
                    assignedParrains.push(parrainsMelanges[parrainIndex]);
                    parrainIndex++;
                    
                    // Attribution d'un deuxième parrain si nécessaire pour équilibrer
                    const parrainRestants = parrainsMelanges.length - parrainIndex;
                    const filleulRestants = filleulsMelanges.length - filleulIndex - 1;
                    
                    if (parrainRestants > filleulRestants && parrainIndex < parrainsMelanges.length) {
                        assignedParrains.push(parrainsMelanges[parrainIndex]);
                        parrainIndex++;
                    }
                    
                    newAttributions.push({
                        id: newAttributions.length + 1,
                        filleul: filleul,
                        parrains: assignedParrains
                    });
                });
                
            } else {
                // CAS 2: Plus de filleuls que de parrains
                // Distribuer les parrains de façon aléatoire, certains parrains auront 2 filleuls
                
                let filleulIndex = 0;
                
                parrainsMelanges.forEach((parrain, parrainIdx) => {
                    // Calculer combien de filleuls ce parrain doit superviser
                    const filleulRestants = filleulsMelanges.length - filleulIndex;
                    const parrainRestants = parrainsMelanges.length - parrainIdx;
                    const filleulsParParrain = Math.ceil(filleulRestants / parrainRestants);
                    
                    for (let i = 0; i < filleulsParParrain && filleulIndex < filleulsMelanges.length; i++) {
                        newAttributions.push({
                            id: newAttributions.length + 1,
                            filleul: filleulsMelanges[filleulIndex],
                            parrains: [parrain]
                        });
                        filleulIndex++;
                    }
                });
            }

            setAttributions(newAttributions);
            
            // Sauvegarder les données dans le backend
            await saveDataToBackend(newAttributions);
            
            setCurrentStep(4);
            
            const totalParrains = [...new Set(newAttributions.flatMap(attr => attr.parrains.map(p => p.id)))].length;
            const totalFilleuls = newAttributions.length;
            
            toast.success(
                `✅ ${newAttributions.length} attributions générées avec succès!\n` +
                `👨‍🎓 ${totalParrains} parrains assignés\n` +
                `👨‍🎒 ${totalFilleuls} filleuls avec parrain(s)\n` +
                `💾 Données sauvegardées dans la base de données`
            );
            
        } catch (error) {
            toast.error('Erreur lors de la génération des attributions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [parrainsList, filleulsList, shuffleArray, saveDataToBackend]);

    // Fonction pour générer et télécharger le PDF AMÉLIORÉE
    const generatePDF = useCallback(() => {
        if (attributions.length === 0) {
            toast.error('Aucune attribution à télécharger');
            return;
        }

        try {
            const doc = new jsPDF();
            const currentDate = new Date();
            const dateStr = currentDate.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const timeStr = currentDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // EN-TÊTE PROFESSIONNEL
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            // Titre centré et adapté à la largeur
            const title = 'INSTITUT DES SCIENCES ET TECHNIQUES DE LA COMMUNICATION';
            const pageWidth = doc.internal.pageSize.width;
            const titleWidth = doc.getTextWidth(title);
            const titleX = (pageWidth - titleWidth) / 2;
            doc.text(title, titleX, 25);
            
            // Ligne de séparation
            doc.setLineWidth(0.5);
            doc.line(20, 30, 190, 30);
            
            doc.setFontSize(18);
            doc.setTextColor(66, 139, 202);
            doc.text(`ATTRIBUTIONS ALÉATOIRES DE PARRAINAGE - ${selectedFiliere}`, 20, 45);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Généré le ${dateStr} à ${timeStr}`, 20, 55);
            
            // Indication de l'attribution aléatoire
            doc.setFontSize(10);
            doc.setTextColor(255, 140, 0);
            doc.text('🎲 Attribution effectuée de manière aléatoire pour garantir l\'équité', 20, 62);

            // STATISTIQUES
            const totalParrains = [...new Set(attributions.flatMap(attr => attr.parrains.map(p => p.id)))].length;
            const totalFilleuls = attributions.length;
            const filleulsWith2Parrains = attributions.filter(attr => attr.parrains.length === 2).length;
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`📊 Statistiques: ${totalParrains} parrains • ${totalFilleuls} filleuls • ${attributions.length} attributions`, 20, 72);
            if (filleulsWith2Parrains > 0) {
                doc.text(`⚡ ${filleulsWith2Parrains} filleul(s) avec 2 parrains`, 20, 79);
            }

            // TABLEAU DES ATTRIBUTIONS
            const tableData = attributions.map((attr, index) => [
                (index + 1).toString(),
                attr.parrains.map(p => p.fullName).join('\n+ '),
                attr.parrains.map(p => p.email).join('\n'),
                attr.filleul.fullName,
                attr.filleul.email
            ]);

            doc.autoTable({
                head: [['#', 'Parrain(s)', 'Email(s) Parrain(s)', 'Filleul', 'Email Filleul']],
                body: tableData,
                startY: 87,
                styles: { 
                    fontSize: 9,
                    cellPadding: 4,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                headStyles: { 
                    fillColor: [66, 139, 202],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 10
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 250]
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 45 },
                    2: { cellWidth: 50 },
                    3: { cellWidth: 40 },
                    4: { cellWidth: 40 }
                },
                didDrawPage: (data) => {
                    // Pied de page
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(
                        `Document généré automatiquement par le Système de Parrainage ISTC - Page ${data.pageNumber}`,
                        20,
                        doc.internal.pageSize.height - 10
                    );
                }
            });

            // SAUVEGARDE
            const fileName = `parrainage_${selectedFiliere.toLowerCase()}_${currentDate.toISOString().split('T')[0]}_${currentDate.getTime()}.pdf`;
            doc.save(fileName);

            // AJOUT À L'HISTORIQUE
            const newHistorique = {
                id: Date.now(),
                filiere: selectedFiliere,
                date: currentDate.toISOString(),
                parrains: parrainsList.length,
                filleuls: filleulsList.length,
                attributions: attributions.length,
                fileName: fileName,
                stats: {
                    totalParrains,
                    totalFilleuls,
                    filleulsWith2Parrains
                }
            };

            setHistorique(prev => [newHistorique, ...prev]);
            toast.success(`✅ PDF téléchargé: ${fileName}\n📁 Sauvegardé dans l'historique`);

        } catch (error) {
            toast.error('❌ Erreur lors de la génération du PDF');
            console.error(error);
        }
    }, [attributions, selectedFiliere, parrainsList.length, filleulsList.length]);

    // Fonction pour redémarrer le processus
    const resetProcess = () => {
        setCurrentStep(1);
        setSelectedFiliere('');
        setParrainsList([]);
        setFilleulsList([]);
        setAttributions([]);
    };

    return (
        <div className="parrainage-app">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <h1><Users className="icon" /> Système de Parrainage ISTC</h1>
                    <p>Gestion automatisée des attributions parrain-filleul</p>
                </div>
            </header>

            {/* Navigation des étapes responsive */}
            <div className="steps-navigation">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <span>{isMobile ? 'Filière' : 'Sélection filière'}</span>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <span>{isMobile ? 'Import' : 'Import Excel'}</span>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                    <div className="step-number">3</div>
                    <span>{isMobile ? 'Génération' : 'Attribution'}</span>
                </div>
                <div className={`step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
                    <div className="step-number">4</div>
                    <span>{isMobile ? 'Résultats' : 'Résultats'}</span>
                </div>
                <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>
                    <div className="step-number">5</div>
                    <span>{isMobile ? 'Historique' : 'Historique'}</span>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="main-content">
                {/* Étape 1: Sélection de la filière */}
                {currentStep === 1 && (
                    <div className="step-content">
                        <h2><FileText className="icon" /> Sélection de la filière</h2>
                        <p>Choisissez la filière concernée par cette opération de parrainage :</p>
                        
                        <div className="filiere-grid">
                            {filieres.map(filiere => (
                                <button
                                    key={filiere.code}
                                    className={`filiere-card ${selectedFiliere === filiere.name ? 'selected' : ''}`}
                                    onClick={() => setSelectedFiliere(filiere.name)}
                                >
                                    <h3>{filiere.name}</h3>
                                    <p className="filiere-description">{filiere.fullName}</p>
                                    <small>{filiere.code.toUpperCase()}</small>
                                </button>
                            ))}
                        </div>

                        {selectedFiliere && (
                            <div className="actions">
                                <button 
                                    className="btn-primary"
                                    onClick={() => setCurrentStep(2)}
                                >
                                    Continuer avec {selectedFiliere}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Étape 2: Import des fichiers */}
                {currentStep === 2 && (
                    <div className="step-content">
                        <h2><Upload className="icon" /> Import des listes Excel</h2>
                        <p>Importez les fichiers .xlsx contenant les noms complets (une seule colonne) :</p>

                        <div className="import-section">
                            <div className="import-card">
                                <h3>Liste des Parrains</h3>
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={(e) => handleFileUpload(e, 'parrains')}
                                    className="file-input"
                                />
                                {parrainsList.length > 0 && (
                                    <div className="file-preview">
                                        <CheckCircle className="icon success" />
                                        <span>{parrainsList.length} parrains importés</span>
                                        <div className="preview-list">
                                            {parrainsList.slice(0, 3).map(p => (
                                                <div key={p.id} className="preview-item">
                                                    <strong>{p.fullName}</strong>
                                                    <small>{p.email}</small>
                                                </div>
                                            ))}
                                            {parrainsList.length > 3 && <small>... et {parrainsList.length - 3} autres</small>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="import-card">
                                <h3>Liste des Filleuls</h3>
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={(e) => handleFileUpload(e, 'filleuls')}
                                    className="file-input"
                                />
                                {filleulsList.length > 0 && (
                                    <div className="file-preview">
                                        <CheckCircle className="icon success" />
                                        <span>{filleulsList.length} filleuls importés</span>
                                        <div className="preview-list">
                                            {filleulsList.slice(0, 3).map(f => (
                                                <div key={f.id} className="preview-item">
                                                    <strong>{f.fullName}</strong>
                                                    <small>{f.email}</small>
                                                </div>
                                            ))}
                                            {filleulsList.length > 3 && <small>... et {filleulsList.length - 3} autres</small>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="actions">
                            <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
                                Retour
                            </button>
                            {parrainsList.length > 0 && filleulsList.length > 0 && (
                                <button className="btn-primary" onClick={() => setCurrentStep(3)}>
                                    Continuer vers la génération
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Étape 3: Génération */}
                {currentStep === 3 && (
                    <div className="step-content">
                        <h2><Users className="icon" /> Génération d'attributions aléatoires</h2>
                        
                        <div className="generation-summary">
                            <div className="summary-card">
                                <h3>📋 Résumé de l'opération</h3>
                                <div className="summary-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Filière :</span>
                                        <span className="stat-value">{selectedFiliere}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Parrains :</span>
                                        <span className="stat-value">{parrainsList.length}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Filleuls :</span>
                                        <span className="stat-value">{filleulsList.length}</span>
                                    </div>
                                </div>
                                
                                <div className="random-method-info">
                                    <h4>🎲 Méthode d'attribution aléatoire :</h4>
                                    <p><strong>Les listes de parrains et filleuls seront mélangées de manière aléatoire</strong> avant l'attribution pour garantir une répartition équitable et impartiale.</p>
                                </div>
                                
                                <div className="algorithm-info">
                                    <h4>🎯 Règles d'attribution :</h4>
                                    {parrainsList.length >= filleulsList.length ? (
                                        <div className="rule-explanation">
                                            <p><strong>Cas :</strong> Plus de parrains que de filleuls ({parrainsList.length} vs {filleulsList.length})</p>
                                            <p><strong>Règle :</strong> Chaque filleul aura un parrain, et {parrainsList.length - filleulsList.length} filleul(s) auront 2 parrains pour utiliser tous les parrains.</p>
                                            <p><strong>Résultat attendu :</strong> {filleulsList.length} attributions avec tous les {parrainsList.length} parrains assignés</p>
                                        </div>
                                    ) : (
                                        <div className="rule-explanation">
                                            <p><strong>Cas :</strong> Plus de filleuls que de parrains ({filleulsList.length} vs {parrainsList.length})</p>
                                            <p><strong>Règle :</strong> Chaque parrain aura au moins un filleul, et certains parrains auront 2 filleuls pour que tous les filleuls aient un parrain.</p>
                                            <p><strong>Résultat attendu :</strong> {filleulsList.length} attributions avec tous les {parrainsList.length} parrains assignés</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="actions">
                            <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
                                Retour
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={generateAttributions}
                                disabled={loading}
                            >
                                {loading ? 'Génération...' : 'Générer les attributions'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Étape 4: Résultats */}
                {currentStep === 4 && (
                    <div className="step-content">
                        <h2><CheckCircle className="icon" /> Résultats des attributions aléatoires</h2>
                        
                        {/* Indication de l'attribution aléatoire */}
                        <div className="random-info">
                            <div className="alert alert-info">
                                <strong>🎲 Attribution aléatoire effectuée :</strong> Les parrains et filleuls ont été mélangés de manière aléatoire pour garantir une répartition équitable et impartiale.
                            </div>
                        </div>
                        
                        <div className="results-summary">
                            <div className="stat-card">
                                <h3>{attributions.length}</h3>
                                <p>Attributions générées</p>
                            </div>
                            <div className="stat-card">
                                <h3>{[...new Set(attributions.flatMap(attr => attr.parrains.map(p => p.id)))].length}</h3>
                                <p>Parrains assignés</p>
                            </div>
                            <div className="stat-card">
                                <h3>{attributions.filter(attr => attr.parrains.length === 2).length}</h3>
                                <p>Filleuls avec 2 parrains</p>
                            </div>
                            <div className="stat-card">
                                <h3>{attributions.filter(attr => {
                                    const parrainIds = attr.parrains.map(p => p.id);
                                    return attributions.filter(a => a.parrains.some(p => parrainIds.includes(p.id))).length > 1;
                                }).length}</h3>
                                <p>Parrains avec 2+ filleuls</p>
                            </div>
                        </div>

                        <div className="attributions-table">
                            <h3>Tableau des attributions (ordre aléatoire)</h3>
                            
                            {/* Vue mobile avec cartes */}
                            {isMobile ? (
                                <div className="mobile-cards-container">
                                    {attributions.map((attr, index) => (
                                        <div key={index} className={`attribution-card ${attr.parrains.length === 2 ? 'highlight-card' : ''}`}>
                                            <div className="card-header">
                                                <span className="card-number">#{index + 1}</span>
                                                {attr.parrains.length === 2 && (
                                                    <span className="multiple-badge">2 parrains</span>
                                                )}
                                            </div>
                                            
                                            <div className="card-section">
                                                <h4>Parrain(s)</h4>
                                                {attr.parrains.map((p, i) => (
                                                    <div key={i} className="mobile-parrain-item">
                                                        <strong>{p.fullName}</strong>
                                                        {attr.parrains.length === 2 && (
                                                            <span className="role-badge">
                                                                {i === 0 ? 'Principal' : 'Secondaire'}
                                                            </span>
                                                        )}
                                                        <div className="mobile-email">
                                                            <Mail className="icon" />
                                                            <span>{p.email}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="card-section">
                                                <h4>Filleul</h4>
                                                <div className="mobile-filleul-item">
                                                    <strong>{attr.filleul.fullName}</strong>
                                                    <div className="mobile-email">
                                                        <Mail className="icon" />
                                                        <span>{attr.filleul.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Vue desktop avec tableau */
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{width: '50px'}}>#</th>
                                                <th style={{width: '200px'}}>Parrain(s)</th>
                                                <th style={{width: '250px'}}>Email(s) Parrain(s)</th>
                                                <th style={{width: '150px'}}>Filleul</th>
                                                <th style={{width: '200px'}}>Email Filleul</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attributions.map((attr, index) => (
                                                <tr key={index} className={attr.parrains.length === 2 ? 'highlight-row' : ''}>
                                                    <td className="index-cell">{index + 1}</td>
                                                    <td className="parrain-cell">
                                                        {attr.parrains.map((p, i) => (
                                                            <div key={i} className="parrain-item">
                                                                <strong>{p.fullName}</strong>
                                                                {attr.parrains.length === 2 && (
                                                                    <span className="parrain-badge">
                                                                        {i === 0 ? 'Parrain principal' : 'Parrain secondaire'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="email-cell">
                                                        {attr.parrains.map((p, i) => (
                                                            <div key={i} className="email-item">
                                                                <Mail className="icon" />
                                                                <span>{p.email}</span>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="filleul-cell">
                                                        <strong>{attr.filleul.fullName}</strong>
                                                    </td>
                                                    <td className="email-cell">
                                                        <div className="email-item">
                                                            <Mail className="icon" />
                                                            <span>{attr.filleul.email}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="actions">
                            <button className="btn-secondary" onClick={resetProcess}>
                                Nouveau parrainage
                            </button>
                            <button className="btn-warning" onClick={generateAttributions} disabled={loading}>
                                🎲 Régénérer (nouvelle attribution aléatoire)
                            </button>
                            <button className="btn-success" onClick={generatePDF}>
                                <Download className="icon" />
                                Télécharger PDF
                            </button>
                            <button className="btn-primary" onClick={() => setCurrentStep(5)}>
                                Voir l'historique
                            </button>
                        </div>
                    </div>
                )}

                {/* Étape 5: Historique */}
                {currentStep === 5 && (
                    <div className="step-content">
                        <h2><History className="icon" /> Historique des opérations</h2>
                        
                        {historique.length > 0 ? (
                            <div className="historique-list">
                                {historique.map(entry => (
                                    <div key={entry.id} className="historique-card">
                                        <div className="historique-header">
                                            <h3>{entry.filiere}</h3>
                                            <span className="date">
                                                {new Date(entry.date).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="historique-stats">
                                            <span>{entry.parrains} parrains</span>
                                            <span>{entry.filleuls} filleuls</span>
                                            <span>{entry.attributions} attributions</span>
                                        </div>
                                        <div className="historique-actions">
                                            <span className="filename">{entry.fileName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <History className="icon" />
                                <h3>Aucun historique</h3>
                                <p>Les opérations de parrainage apparaîtront ici</p>
                            </div>
                        )}

                        <div className="actions">
                            <button className="btn-primary" onClick={resetProcess}>
                                Nouveau parrainage
                            </button>
                            {attributions.length > 0 && (
                                <button className="btn-secondary" onClick={() => setCurrentStep(4)}>
                                    Retour aux résultats
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Traitement en cours...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParrainageApp;