# 🏛️ PGCC - Portail de Gestion des Citoyens Congolais

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)](https://www.postgresql.org/)

> **Une plateforme numérique gouvernementale pour centraliser et simplifier l'accès aux services publics en RDC**

![RDC Flag Colors](https://img.shields.io/badge/Made%20for-RDC-blue?style=flat-square)

---

## 📋 À propos du projet

**GovCitizen App** est une plateforme numérique gouvernementale moderne conçue pour la République Démocratique du Congo. Elle centralise et simplifie l'accès aux services publics pour les citoyens, tout en offrant des outils robustes pour l'administration.

✨ **Défendu avec succès le 10 octobre 2025** en tant que projet de Licence (Bac+5) en Informatique de Gestion à l'ISP Bukavu.

---

## 🚀 Fonctionnalités Principales

### 🏛️ Services aux Citoyens & État Civil
- **Gestion de l'Identité** : Profil citoyen sécurisé avec photo et informations biométriques
- **État Civil Numérique** : Actes de naissance, mariage, divorce et décès
- **Documents Officiels** : Demande et suivi en temps réel

### 🏥 Santé Numérique
- **Dossier Médical Électronique** : Historique des consultations et examens
- **Accès par QR Code** : Partage sécurisé des données médicales

### 🔐 API Entreprises & Sécurité
- **Vérification d'Identité (KYC)** : Pour les banques et télécoms
- **Gestion des Clés API** : Tableau de bord développeur
- **Audit & Intégrité** : Journalisation immuable des actions

### 🎨 Expérience Utilisateur
- **Design Premium** : Interface moderne et responsive aux couleurs de la RDC
- **Accessibilité WCAG** : Conforme aux standards internationaux
- **Multilingue** : Support du français et anglais

---

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **UI Components** | Shadcn UI, Lucide React, Framer Motion |
| **Backend** | Next.js API Routes |
| **Base de Données** | PostgreSQL + Prisma ORM |
| **Authentification** | NextAuth.js avec MFA (TOTP) |
| **Biométrie** | face-api.js (reconnaissance faciale) |
| **Génération PDF** | @react-pdf/renderer |
| **Visualisation** | Recharts |
| **Sécurité** | AES-256-GCM, JWT, CORS |

---

## 💻 Installation & Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou pnpm
- PostgreSQL 13+
- Git

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/felicienmukamba/pgcc.git
cd pgcc
```

### 2️⃣ Installer les dépendances
```bash
npm install
# ou
pnpm install
```

### 3️⃣ Configurer l'environnement

Créez un fichier `.env.local` à la racine :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/pgcc_db"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"

# Biométrie (optionnel)
NEXT_PUBLIC_FACE_API_URL="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js"

# Services externes (si applicable)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4️⃣ Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer et migrer la base
npx prisma migrate dev --name init

# Remplir avec des données de test (optionnel)
npm run seed
```

### 5️⃣ Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000** 🎉

---

## 📂 Structure du Projet

```
pgcc/
├── app/
│   ├── api/                    # Endpoints API
│   │   ├── auth/               # Authentification NextAuth
│   │   ├── citizens/           # Gestion des citoyens
│   │   ├── health/             # Dossiers médicaux
│   │   ├── documents/          # Documents administratifs
│   │   └── enterprises/        # API Entreprises & KYC
│   ├── dashboard/              # Espace connecté
│   │   ├── citizen/            # Portail citoyen
│   │   ├── health/             # Santé numérique
│   │   └── admin/              # Tableau de bord admin
│   ├── legal/                  # Pages légales
│   └── layout.tsx              # Layout racine
├── components/
│   ├── ui/                     # Composants de base (Button, Card, Input...)
│   ├── dashboard/              # Composants du dashboard
│   ├── profile/                # Gestion du profil
│   └── common/                 # Composants réutilisables
├── lib/
│   ├── auth.ts                 # Configuration NextAuth
│   ├── db.ts                   # Client Prisma
│   ├── validations.ts          # Schémas Zod
│   └── utils.ts                # Fonctions utilitaires
├── prisma/
│   ├── schema.prisma           # Schéma de base de données
│   └── seed.ts                 # Données de test
├── public/                     # Assets statiques
└── styles/                     # Styles globaux
```

---

## 🔧 Scripts npm Disponibles

```bash
npm run dev          # Démarrer en développement
npm run build        # Builder pour production
npm start            # Lancer la version produite
npm run lint         # Vérifier le code (ESLint)
npm run type-check   # Vérifier les types TypeScript
npm run prisma:studio # Ouvrir Prisma Studio
npm run seed         # Remplir la BD avec des données de test
npm run migrate      # Lancer les migrations Prisma
```

---

## 🔗 Endpoints API Principaux

### 🔐 Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/session` - Session utilisateur

### 👤 Citoyens
- `GET /api/citizens/:id` - Récupérer profil
- `PUT /api/citizens/:id` - Mettre à jour profil
- `POST /api/citizens/:id/documents` - Upload documents

### 🏥 Santé
- `GET /api/health/records/:id` - Dossier médical
- `POST /api/health/records` - Ajouter entrée médicale
- `GET /api/health/records/:id/qr` - Générer QR Code

### 🏛️ État Civil
- `POST /api/civil-status/birth-certificate` - Acte de naissance
- `POST /api/civil-status/marriage` - Acte de mariage

### 🔓 API Entreprises
- `POST /api/enterprises/verify-identity` - Vérification KYC
- `GET /api/enterprises/keys` - Gestion des clés API

---

## 🚨 Dépannage Courant

### Erreur: `DATABASE_URL not found`
```bash
# Vérifiez que .env.local est créé et contient DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### Erreur: `Port 3000 déjà utilisé`
```bash
# Utilisez un autre port
npm run dev -- -p 3001
```

### Erreur: `Prisma Client not generated`
```bash
# Régénérez le client Prisma
npx prisma generate
```

### La base de données ne se connecte pas
```bash
# Testez la connexion PostgreSQL
psql postgresql://user:password@localhost:5432/pgcc_db
```

---

## 🌐 Déploiement en Production

### Déployer sur Vercel (Recommandé pour Next.js)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Déployer sur Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t pgcc .
docker run -p 3000:3000 pgcc
```

### Variables d'environnement en Production
- Utilisez les secrets du provider (Vercel Secrets, GitHub Secrets, etc.)
- Ne commitez **JAMAIS** les `.env` dans Git
- Changez `NEXTAUTH_SECRET` et les mots de passe BD

---

## 📊 Variables d'Environnement

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL |
| `NEXTAUTH_SECRET` | ✅ | Clé de chiffrement NextAuth (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | URL de l'app (http://localhost:3000 en dev) |
| `NEXT_PUBLIC_API_BASE_URL` | ❌ | URL de base des API |
| `SMTP_HOST` | ❌ | Serveur SMTP pour emails |
| `SMTP_USER` | ❌ | Email SMTP |
| `SMTP_PASS` | ❌ | Mot de passe SMTP |

---

## 🤝 Contribuer

Les contributions sont **les bienvenues** ! Voici comment :

1. **Fork** le projet
2. **Créer une branche** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add: AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

### Conventions de Code
- ✅ Utilisez TypeScript
- ✅ Respectez le style Prettier
- ✅ Écrivez des tests pour les nouvelles features
- ✅ Documentez les changements majeurs

---

## 📄 Licence

Ce projet est sous **licence MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Contact & Support

**Développé par** : Felicien Mukamba

- 📱 **WhatsApp/Tél** : +243 995 209 133
- 📧 **Email** : [votre-email@domain.com]
- 🔗 **GitHub** : [@felicienmukamba](https://github.com/felicienmukamba)
- 💼 **LinkedIn** : [Votre LinkedIn](#)

---

## 🎯 Feuille de Route

- [ ] V1.0 - MVP Etat Civil
- [ ] V1.1 - Module Santé
- [ ] V1.2 - API Entreprises KYC
- [ ] V2.0 - Blockchain pour audit immuable
- [ ] V2.1 - Application mobile (React Native)
- [ ] V3.0 - Intégration avec administrations régionales

---

## ❤️ Soutien

Si ce projet vous plaît, **⭐ donnez une star** ! Cela nous aide énormément.

---

**Développé avec ❤️ pour la République Démocratique du Congo** 🇨🇩

*« Et si la digitalisation était le moteur d'une économie à plusieurs milliards ? »*
