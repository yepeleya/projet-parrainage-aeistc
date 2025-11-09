const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
require('dotenv').config();

const database = require('./config/database');
const FileGenerator = require('./utils/FileGenerator');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accepter seulement les fichiers Excel
    if (file.mimetype.includes('excel') || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers Excel (.xlsx) sont autorisés'), false);
    }
  }
});

// Middlewares de sécurité et optimisation
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['https://yepeleya.github.io', 'http://localhost:3000'],
  credentials: true
}));

// Middlewares pour le parsing des données
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes API

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend du projet parrainage opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Routes pour les parrains
app.get('/api/parrains', async (req, res) => {
  try {
    const [rows] = await database.execute(
      'SELECT * FROM parrains ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des parrains:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des parrains',
      error: error.message
    });
  }
});

app.post('/api/parrains', async (req, res) => {
  try {
    const { full_name, email, filiere } = req.body;
    
    if (!full_name || !email || !filiere) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (full_name, email, filiere)'
      });
    }

    const [result] = await database.execute(
      'INSERT INTO parrains (full_name, email, filiere, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [full_name, email, filiere]
    );

    res.status(201).json({
      success: true,
      message: 'Parrain créé avec succès',
      data: {
        id: result.insertId,
        full_name,
        email,
        filiere
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du parrain:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du parrain',
      error: error.message
    });
  }
});

// Routes pour les filleuls
app.get('/api/filleuls', async (req, res) => {
  try {
    const [rows] = await database.execute(
      'SELECT * FROM filleuls ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des filleuls:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des filleuls',
      error: error.message
    });
  }
});

app.post('/api/filleuls', async (req, res) => {
  try {
    const { full_name, email, filiere } = req.body;
    
    if (!full_name || !email || !filiere) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (full_name, email, filiere)'
      });
    }

    const [result] = await database.execute(
      'INSERT INTO filleuls (full_name, email, filiere, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [full_name, email, filiere]
    );

    res.status(201).json({
      success: true,
      message: 'Filleul créé avec succès',
      data: {
        id: result.insertId,
        full_name,
        email,
        filiere
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du filleul:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du filleul',
      error: error.message
    });
  }
});

// Routes pour les attributions
app.get('/api/attributions', async (req, res) => {
  try {
    const [rows] = await database.execute(`
      SELECT 
        a.*,
        p.full_name as parrain_name,
        p.email as parrain_email,
        f.full_name as filleul_name,
        f.email as filleul_email
      FROM attributions a
      INNER JOIN parrains p ON a.parrain_id = p.id
      INNER JOIN filleuls f ON a.filleul_id = f.id
      ORDER BY a.created_at DESC
    `);
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des attributions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des attributions',
      error: error.message
    });
  }
});

app.post('/api/attributions', async (req, res) => {
  try {
    const { parrain_id, filleul_id, session_id, filiere } = req.body;
    
    if (!parrain_id || !filleul_id || !session_id || !filiere) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (parrain_id, filleul_id, session_id, filiere)'
      });
    }

    const [result] = await database.execute(
      'INSERT INTO attributions (parrain_id, filleul_id, session_id, attribution_date, filiere, created_at, updated_at) VALUES (?, ?, ?, NOW(), ?, NOW(), NOW())',
      [parrain_id, filleul_id, session_id, filiere]
    );

    res.status(201).json({
      success: true,
      message: 'Attribution créée avec succès',
      data: {
        id: result.insertId,
        parrain_id,
        filleul_id,
        session_id,
        filiere
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'attribution:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'attribution',
      error: error.message
    });
  }
});

// Route pour traitement en lot des données du frontend
app.post('/api/process-data', async (req, res) => {
  try {
    const { parrains, filleuls, attributions, session_id } = req.body;
    
    if (!parrains || !filleuls || !attributions || !session_id) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes (parrains, filleuls, attributions, session_id requis)'
      });
    }

    // Démarrer une transaction
    await database.beginTransaction();

    try {
      // Insérer les parrains
      const parrainIds = {};
      for (const parrain of parrains) {
        const [result] = await database.execute(
          'INSERT INTO parrains (full_name, email, filiere, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [parrain.full_name, parrain.email, parrain.filiere]
        );
        parrainIds[parrain.full_name] = result.insertId;
      }

      // Insérer les filleuls
      const filleulIds = {};
      for (const filleul of filleuls) {
        const [result] = await database.execute(
          'INSERT INTO filleuls (full_name, email, filiere, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
          [filleul.full_name, filleul.email, filleul.filiere]
        );
        filleulIds[filleul.full_name] = result.insertId;
      }

      // Insérer les attributions
      for (const attribution of attributions) {
        const parrainId = parrainIds[attribution.parrain_name];
        const filleulId = filleulIds[attribution.filleul_name];
        
        if (parrainId && filleulId) {
          await database.execute(
            'INSERT INTO attributions (parrain_id, filleul_id, session_id, attribution_date, filiere, created_at, updated_at) VALUES (?, ?, ?, NOW(), ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE updated_at = NOW()',
            [parrainId, filleulId, session_id, attribution.filiere]
          );
        }
      }

      // Valider la transaction
      await database.commit();

      // Générer automatiquement les fichiers Excel finaux
      try {
        const fileGenerator = new FileGenerator();
        const filiere = parrains[0]?.filiere || filleuls[0]?.filiere || 'UNKNOWN';
        
        // Préparer les données d'attribution pour le fichier Excel
        const attributionsForFile = attributions.map(attr => ({
          parrain_name: attr.parrain_name,
          parrain_email: parrains.find(p => p.full_name === attr.parrain_name)?.email || 'N/A',
          filleul_name: attr.filleul_name,
          filleul_email: filleuls.find(f => f.full_name === attr.filleul_name)?.email || 'N/A',
          filiere: attr.filiere
        }));

        const fileResults = await fileGenerator.generateAllFiles(
          parrains,
          filleuls,
          attributionsForFile,
          session_id,
          filiere
        );

        console.log('📁 Fichiers générés automatiquement:', fileResults);

        res.json({
          success: true,
          message: 'Données traitées avec succès',
          counts: {
            parrains: parrains.length,
            filleuls: filleuls.length,
            attributions: attributions.length
          },
          files: fileResults.files
        });

      } catch (fileError) {
        console.error('⚠️ Erreur génération fichiers (non bloquante):', fileError);
        // Ne pas faire échouer la transaction pour une erreur de fichier
        res.json({
          success: true,
          message: 'Données traitées avec succès (erreur génération fichiers)',
          counts: {
            parrains: parrains.length,
            filleuls: filleuls.length,
            attributions: attributions.length
          },
          fileError: fileError.message
        });
      }

    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await database.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors du traitement des données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement des données',
      error: error.message
    });
  }
});

// Route pour l'upload de fichiers Excel
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier uploadé'
      });
    }

    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier',
      error: error.message
    });
  }
});

// Routes pour la gestion des fichiers uploadés
app.get('/api/files', async (req, res) => {
  try {
    const fileGenerator = new FileGenerator();
    const { type } = req.query; // parrains, filleuls, attributions, pdfs, ou all
    
    const files = await fileGenerator.listFiles(type || 'all');
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message
    });
  }
});

// Route pour télécharger un fichier spécifique
app.get('/api/files/download/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    const validTypes = ['parrains', 'filleuls', 'attributions', 'pdfs'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de fichier invalide'
      });
    }

    const filePath = path.join(__dirname, 'uploads', type, filename);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Définir le nom de téléchargement
    const downloadName = filename;
    
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', type === 'pdfs' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du fichier',
      error: error.message
    });
  }
});

// Route pour supprimer un fichier
app.delete('/api/files/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    const validTypes = ['parrains', 'filleuls', 'attributions', 'pdfs'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de fichier invalide'
      });
    }

    const filePath = path.join(__dirname, 'uploads', type, filename);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Supprimer le fichier
    await fsPromises.unlink(filePath);
    
    res.json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du fichier',
      error: error.message
    });
  }
});

// Route pour les statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const [parrains] = await database.execute('SELECT COUNT(*) as total FROM parrains');
    const [filleuls] = await database.execute('SELECT COUNT(*) as total FROM filleuls');
    const [attributions] = await database.execute('SELECT COUNT(*) as total FROM attributions');

    const [filiereStats] = await database.execute(`
      SELECT 
        filiere,
        COUNT(DISTINCT p.id) as parrains_count,
        COUNT(DISTINCT f.id) as filleuls_count,
        COUNT(DISTINCT a.id) as attributions_count
      FROM 
        (SELECT DISTINCT filiere FROM parrains 
         UNION SELECT DISTINCT filiere FROM filleuls) filieres
      LEFT JOIN parrains p ON filieres.filiere = p.filiere
      LEFT JOIN filleuls f ON filieres.filiere = f.filiere
      LEFT JOIN attributions a ON filieres.filiere = a.filiere
      GROUP BY filiere
      ORDER BY filiere
    `);

    res.json({
      success: true,
      data: {
        global: {
          total_parrains: parrains[0].total,
          total_filleuls: filleuls[0].total,
          total_attributions: attributions[0].total
        },
        par_filiere: filiereStats
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// Middleware de gestion d'erreurs
app.use((error, req, res) => {
  console.error('Erreur:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📱 API accessible à: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});