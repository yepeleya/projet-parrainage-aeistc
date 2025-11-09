# Projet Parrainage - Structure Backend/Frontend

## 📁 Structure du Projet

```
projet-parrainage/
├── frontend/                    # Application React
│   ├── src/
│   │   ├── components/
│   │   │   ├── ParrainageApp.jsx  # Composant principal
│   │   │   └── ParrainageApp.css
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json             # Dépendances React + proxy backend
│   └── LISTE-*.xlsx            # Fichiers Excel d'exemple
│
├── backend/                     # API Node.js/Express
│   ├── config/
│   │   └── database.js         # Configuration MySQL
│   ├── migrations/
│   │   ├── migrate.js          # Gestionnaire de migrations
│   │   ├── 001_create_parrains_table.sql
│   │   ├── 002_create_filleuls_table.sql
│   │   ├── 003_create_attributions_table.sql
│   │   ├── 004_create_stats_cache_table.sql
│   │   ├── 005_create_view_attributions_completes.sql
│   │   └── 006_insert_example_data.sql
│   ├── utils/
│   │   └── FileGenerator.js    # Génération automatique fichiers Excel
│   ├── uploads/                # Fichiers générés automatiquement
│   │   ├── parrains/          # Fichiers Excel des parrains finaux
│   │   ├── filleuls/          # Fichiers Excel des filleuls finaux
│   │   ├── attributions/      # Fichiers Excel des attributions finales
│   │   └── pdfs/             # Fichiers PDF générés
│   ├── .env                   # Variables d'environnement
│   ├── app.js                 # Serveur Express principal
│   └── package.json           # Dépendances backend
│
└── README.md                   # Documentation principale
```

## 🚀 Démarrage

### Backend (Port 5000)
```bash
cd backend
npm install
npm run migrate:fresh  # Créer les tables
npm start              # Démarrer l'API
```

### Frontend (Port 3000)
```bash
cd frontend
npm install
npm start              # Démarrer React
```

## 📡 API Endpoints

### Données
- `GET /api/health` - Health check
- `GET /api/parrains` - Liste des parrains
- `POST /api/parrains` - Créer un parrain
- `GET /api/filleuls` - Liste des filleuls
- `POST /api/filleuls` - Créer un filleul
- `GET /api/attributions` - Liste des attributions
- `POST /api/attributions` - Créer une attribution
- `POST /api/process-data` - Traitement en lot (Frontend → Backend)

### Fichiers
- `GET /api/files` - Lister tous les fichiers générés
- `GET /api/files?type=parrains` - Lister fichiers par type
- `GET /api/files/download/:type/:filename` - Télécharger un fichier
- `DELETE /api/files/:type/:filename` - Supprimer un fichier

### Statistiques
- `GET /api/stats` - Statistiques globales

## 💾 Base de Données

### Tables
- `parrains` - Liste des parrains
- `filleuls` - Liste des filleuls
- `attributions` - Relations parrain-filleul
- `stats_cache` - Cache des statistiques
- `migrations` - Historique des migrations

### Vue
- `v_attributions_completes` - Vue complète avec infos parrain/filleul

## 🔄 Flux de Données

1. **Import** : L'utilisateur charge les fichiers Excel dans le frontend
2. **Attribution** : L'algorithme génère les paires parrain-filleul
3. **Sauvegarde** : Les données sont envoyées au backend via `/api/process-data`
4. **Génération automatique** : Le backend génère automatiquement :
   - `PARRAINS_FINAUX_[FILIERE]_[DATE].xlsx`
   - `FILLEULS_FINAUX_[FILIERE]_[DATE].xlsx`
   - `ATTRIBUTIONS_FINALES_[FILIERE]_[DATE].xlsx`
5. **Téléchargement** : Les fichiers sont disponibles via l'API

## 🛠 Fonctionnalités

### Frontend
- Interface responsive
- Import fichiers Excel
- Algorithme d'attribution aléatoire et équilibré
- Génération PDF
- Nettoyage automatique caractères spéciaux
- Communication temps réel avec backend

### Backend
- API REST complète
- Base de données MySQL
- Système de migrations
- Génération automatique fichiers Excel
- Upload/téléchargement fichiers
- Statistiques en temps réel
- Gestion d'erreurs robuste

## 🔧 Configuration

### Variables d'environnement (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=parrainage_db
DB_PORT=3306
PORT=5000
NODE_ENV=development
```

### Proxy Frontend
Le frontend utilise un proxy vers `http://localhost:5000` pour les appels API.

## 🎯 Améliorations Apportées

1. **Structure séparée** : Frontend et Backend dans des dossiers distincts
2. **Sauvegarde automatique** : Génération automatique des fichiers Excel après attribution
3. **API complète** : Endpoints pour toutes les opérations CRUD
4. **Base de données** : Persistance de toutes les données
5. **Gestion fichiers** : Upload, téléchargement, suppression via API
6. **Statistiques** : Suivi en temps réel des données
7. **Migrations** : Gestion professionnelle de la structure de base

## 🌟 Points Forts

- **Séparation des responsabilités** : Frontend/Backend bien séparés
- **Persistence des données** : Toutes les données sont sauvegardées
- **Génération automatique** : Plus besoin de télécharger manuellement
- **API REST** : Architecture moderne et extensible
- **Base de données** : Structure normalisée avec relations
- **Fichiers organisés** : Classement automatique par type et date