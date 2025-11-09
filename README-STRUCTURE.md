# Projet Parrainage ISTC - Structure Complète

## 📁 Structure du Projet

```
projet-parrainage/
├── frontend/                    # Application React
│   ├── src/
│   │   ├── components/
│   │   │   ├── ParrainageApp.jsx
│   │   │   └── ParrainageApp.css
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── LISTE-*.xlsx            # Fichiers Excel d'exemple
├── backend/                     # API Node.js/Express
│   ├── config/
│   │   └── database.js         # Configuration MySQL
│   ├── migrations/             # Migrations de base de données
│   │   ├── migrate.js
│   │   └── *.sql
│   ├── utils/
│   │   └── FileGenerator.js    # Générateur de fichiers Excel
│   ├── uploads/                # Fichiers générés automatiquement
│   │   ├── parrains/           # Fichiers Excel des parrains finaux
│   │   ├── filleuls/           # Fichiers Excel des filleuls finaux
│   │   ├── attributions/       # Fichiers Excel des attributions finales
│   │   └── pdfs/               # PDFs générés
│   ├── app.js                  # Serveur Express principal
│   ├── package.json
│   └── .env                    # Configuration environnement
└── README-STRUCTURE.md         # Ce fichier
```

## 🚀 Démarrage Rapide

### 1. Backend (Port 5000)
```bash
cd backend
npm install
npm run migrate:fresh  # Créer la base de données
npm start              # Démarrer le serveur
```

### 2. Frontend (Port 3000)
```bash
cd frontend
npm install
npm start              # Démarrer React
```

## ✨ Nouvelles Fonctionnalités

### 🔄 Sauvegarde Automatique des Fichiers
Après chaque attribution, le système génère automatiquement :
- **PARRAINS_FINAUX_{FILIERE}_{TIMESTAMP}.xlsx** → `backend/uploads/parrains/`
- **FILLEULS_FINAUX_{FILIERE}_{TIMESTAMP}.xlsx** → `backend/uploads/filleuls/`
- **ATTRIBUTIONS_FINALES_{FILIERE}_{TIMESTAMP}.xlsx** → `backend/uploads/attributions/`

### 📡 API Endpoints

#### Données principales
- `GET /api/health` - Status du serveur
- `POST /api/process-data` - Traiter les données et générer les fichiers
- `GET /api/stats` - Statistiques globales

#### Gestion des fichiers
- `GET /api/files` - Lister tous les fichiers générés
- `GET /api/files?type=parrains` - Lister les fichiers par type
- `GET /api/files/download/{type}/{filename}` - Télécharger un fichier
- `DELETE /api/files/{type}/{filename}` - Supprimer un fichier

### 🗃️ Base de Données
Tables créées automatiquement :
- `parrains` - Informations des parrains
- `filleuls` - Informations des filleuls  
- `attributions` - Relations parrain-filleul
- `stats_cache` - Cache des statistiques
- `migrations` - Suivi des migrations

## 🔧 Configuration

### Frontend (React)
- **Proxy configuré** : `/api` → `http://localhost:5000/api`
- **Production** : `https://yepeleya.github.io/projet-parrainage`

### Backend (Express)
- **Port** : 5000
- **CORS** : Autorise GitHub Pages et localhost:3000
- **Base de données** : MySQL avec charset utf8mb4_general_ci

### Variables d'environnement (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=parrainage_db
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## 📋 Workflow Complet

1. **Import** : Charger les fichiers Excel des parrains et filleuls
2. **Attribution** : Algorithme automatique d'attribution équilibrée
3. **Sauvegarde** : 
   - Données dans MySQL
   - Fichiers Excel finaux dans `/uploads/`
4. **Export** : 
   - PDF professionnel téléchargeable
   - Fichiers Excel récupérables via API

## 🛠️ Développement

### Commandes utiles
```bash
# Backend
npm run migrate:fresh    # Recréer la DB
npm run migrate         # Appliquer migrations
npm run dev            # Mode développement avec nodemon

# Frontend  
npm start              # Serveur de développement
npm run build          # Build production
npm run deploy         # Déployer sur GitHub Pages
```

### Tests API
```javascript
// Test health check
fetch('/api/health')

// Test sauvegarde données
fetch('/api/process-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'TEST_123',
    parrains: [...],
    filleuls: [...],
    attributions: [...]
  })
})
```

## 📞 Support

- **Frontend** : React 18.3.1, Lucide Icons, React Hot Toast
- **Backend** : Node.js, Express 4.18.2, MySQL2
- **Base de données** : MySQL 8.0+
- **Fichiers** : XLSX, jsPDF

---
*Mise à jour : 9 novembre 2025*