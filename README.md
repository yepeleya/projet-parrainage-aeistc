# 🎓 Système de Parrainage ISTC

[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?logo=javascript)](https://javascript.info/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Application web professionnelle de gestion de parrainage pour l'Institut Supérieur de Technologie et de Communication (ISTC)

## 📋 **Aperçu**

Système moderne et responsive permettant l'attribution **aléatoire et équitable** de parrains à des filleuls pour toutes les filières de l'ISTC. L'application garantit une distribution juste grâce à l'algorithme Fisher-Yates et génère automatiquement les documents PDF professionnels.

## ✨ **Fonctionnalités**

### 🎯 **Core Features**
- ✅ **Attribution aléatoire** avec algorithme Fisher-Yates
- ✅ **Multi-filières** : EAIN, EJ, EPA, EPM, ETTA
- ✅ **Import Excel** automatisé pour parrains/filleuls
- ✅ **Export PDF** professionnel avec statistiques
- ✅ **Emails académiques** générés automatiquement
- ✅ **Historique** complet des opérations

### 📱 **Design & UX**
- ✅ **100% Responsive** - Mobile, Tablette, Desktop
- ✅ **Interface moderne** avec navigation intuitive
- ✅ **Mobile-first** avec cartes tactiles optimisées
- ✅ **Desktop professionnel** avec tableaux avancés
- ✅ **Notifications** toast en temps réel

### 🔧 **Technique**
- ✅ **React 18** avec Hooks modernes
- ✅ **CSS Grid & Flexbox** responsive
- ✅ **Performance optimisée** avec build production
- ✅ **Code propre** sans warnings ESLint

## 🚀 **Installation & Démarrage**

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/yepeleya/projet-parrainage.git
cd projet-parrainage

# Installer les dépendances
npm install

# Démarrer en mode développement
npm start

# Build pour production
npm run build
```

## 📖 **Guide d'Utilisation**

### 1. 🎯 **Sélection de Filière**
Choisissez parmi les 5 filières ISTC disponibles.

### 2. 📁 **Import des Listes**
- Uploadez les fichiers Excel des **parrains** et **filleuls**
- Format attendu : Nom complet en première colonne
- Validation automatique et génération d'emails @istc.ac.ma

### 3. 🎲 **Attribution Aléatoire**
- Attribution équitable par algorithme Fisher-Yates
- Distribution intelligente (certains filleuls peuvent avoir 2 parrains)
- Aperçu des résultats avant validation

### 4. 📄 **Export PDF**
- Document professionnel avec en-tête ISTC
- Tableau détaillé avec emails académiques
- Statistiques complètes de l'attribution

### 5. 📊 **Historique**
- Suivi de toutes les opérations
- Statistiques par filière et date
- Conservation des métadonnées

## 🏗️ **Architecture**

```
src/
├── App.js                    # Composant racine
├── App.css                   # Styles globaux
├── index.js                  # Point d'entrée React
└── components/
    ├── ParrainageApp.jsx     # Composant principal
    └── ParrainageApp.css     # Styles responsifs complets
```

### 🎯 **Algorithme d'Attribution**
```javascript
// Attribution aléatoire Fisher-Yates
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
```

## 📱 **Responsive Design**

### Breakpoints
- **Mobile Portrait** : ≤479px - Interface cartes
- **Mobile Paysage** : 480-767px - Grille 2 colonnes
- **Tablette** : 768-1023px - Hybride tableau/cartes
- **Desktop** : 1024-1439px - Interface complète
- **Large Screen** : ≥1440px - Layout étendu

### UX Optimisée
- **Mobile** : Cartes tactiles, navigation compacte, boutons 44px+
- **Desktop** : Tableaux scrollables, hover effects, multi-colonnes

## 🛠️ **Technologies**

### Frontend
- **React 18.3.1** - Framework principal
- **Lucide React** - Icônes modernes
- **React Hot Toast** - Notifications
- **jsPDF** - Génération PDF
- **XLSX** - Lecture fichiers Excel

### Styling
- **CSS Custom Properties** - Variables globales
- **CSS Grid & Flexbox** - Layouts responsifs
- **Mobile-First** - Approche responsive

## 📊 **Filières ISTC**

| Code | Nom | Filière Complète |
|------|-----|------------------|
| EAIN | EAIN | École des Arts et Images Numérique |
| EJ | EJ | École de Journalisme |
| EPA | EPA | École Production Audiovisuelle |
| EPM | EPM | École Publicité Marketing |
| ETTA | ETTA | École de Télécommunication |

## 🔒 **Sécurité**

- ✅ Aucune donnée sensible stockée côté client
- ✅ Validation des fichiers Excel uploadés
- ✅ Génération emails académiques sécurisée
- ✅ Pas de stockage permanent des données personnelles

## 🤝 **Contribution**

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 **License**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 **Équipe**

Développé avec ❤️ pour l'ISTC

## 📞 **Support**

Pour toute question ou support, contactez l'équipe de développement.

---

*Institut Supérieur de Technologie et de Communication - Système de Parrainage v1.0*