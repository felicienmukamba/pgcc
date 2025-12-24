# 🛠️ Technologies Utilisées — PGCC

Ce document explique comment chaque technologie est utilisée dans le projet.

---

## 1. Next.js 14 (App Router)

### Pourquoi Next.js ?
- **Server Components** pour le rendu côté serveur des données sensibles
- **API Routes** intégrées pour le backend
- **Middleware** pour l'authentification globale

### Utilisation dans le Projet

```
app/
├── page.tsx              # Landing Page (Server Component)
├── dashboard/
│   ├── page.tsx          # Dashboard principal
│   └── citizens/
│       ├── page.tsx      # Liste des citoyens
│       ├── new/page.tsx  # Formulaire d'enrôlement
│       └── [id]/page.tsx # Détails citoyen
└── api/
    ├── auth/             # Endpoints d'authentification
    └── citizens/         # CRUD citoyens
```

### Configuration Clé
```typescript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true,
  },
}
```

---

## 2. Prisma ORM

### Pourquoi Prisma ?
- **Type-safety** avec génération automatique de types TypeScript
- **Migrations** versionnées pour la base de données
- **Relations** complexes gérées simplement

### Utilisation

```bash
# Générer le client après modification du schéma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Interface d'administration
npx prisma studio
```

### Exemple de Requête
```typescript
import { prisma } from "@/lib/prisma"

// Recherche avec relations
const citizen = await prisma.citizen.findUnique({
  where: { nationalityID: "123456789012" },
  include: {
    consultations: true,
    convictions: true,
  }
})
```

---

## 3. PostgreSQL

### Pourquoi PostgreSQL ?
- **Transactions ACID** pour l'intégrité des données
- **Types avancés** : JSON, Array, UUID
- **Full-text search** intégré

### Schéma Principal
```
┌─────────────────┐     ┌─────────────────┐
│ CitizenIdentity │────>│ CitizenProfile  │
│ (Auth)          │     │ (Encrypted PII) │
└─────────────────┘     └─────────────────┘
        │
        v
┌─────────────────┐
│    AuditLog     │
│ (Hash Chain)    │
└─────────────────┘
```

### Connexion
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pgcc_db"
```

---

## 4. NextAuth.js

### Pourquoi NextAuth ?
- **Session management** sécurisé
- **Multiple providers** (Credentials, OAuth)
- **RBAC** intégré via callbacks

### Configuration
```typescript
// lib/auth.ts
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        // Vérification Argon2id
        // Retourne user avec roles
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.roles = user.roles
      return token
    },
    session({ session, token }) {
      session.user.roles = token.roles
      return session
    }
  }
}
```

---

## 5. Argon2 (argon2id)

### Pourquoi Argon2id ?
- Vainqueur du **Password Hashing Competition** (2015)
- Résistant aux **attaques GPU/ASIC** (memory-hard)
- Recommandé par **OWASP** et **NIST**

### Installation
```bash
pnpm add argon2
```

### Utilisation
```typescript
import argon2 from "argon2"

// Hachage
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,  // 64 MB
  timeCost: 3,
  parallelism: 1,
})

// Vérification
const isValid = await argon2.verify(hash, password)
```

---

## 6. otplib (TOTP/MFA)

### Pourquoi otplib ?
- Compatible **Google Authenticator**, **Authy**, etc.
- Génération de **QR codes** pour l'enrôlement
- Validation sécurisée des tokens

### Installation
```bash
pnpm add otplib
```

### Utilisation
```typescript
import { authenticator } from "otplib"

// Générer un secret
const secret = authenticator.generateSecret()

// Générer l'URI pour QR code
const otpauth = authenticator.keyuri(userId, "PGCC", secret)

// Vérifier un token
const isValid = authenticator.verify({ token, secret })
```

---

## 7. Web Crypto API (AES-256-GCM)

### Pourquoi Web Crypto ?
- **API native** Node.js (pas de dépendance externe)
- **AES-256-GCM** = chiffrement authentifié
- **Performance** optimale

### Utilisation
```typescript
import { webcrypto } from "crypto"

// Chiffrement
const encrypted = await webcrypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  key,
  data
)

// Déchiffrement
const decrypted = await webcrypto.subtle.decrypt(
  { name: "AES-GCM", iv },
  key,
  encryptedData
)
```

---

## 8. Face-API.js

### Pourquoi Face-API ?
- **Reconnaissance faciale** en JavaScript
- Fonctionne **côté client** (navigateur)
- Basé sur **TensorFlow.js**

### Installation
```bash
pnpm add face-api.js @tensorflow/tfjs-node
```

### Utilisation
```typescript
import * as faceapi from "face-api.js"

// Charger les modèles
await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models")
await faceapi.nets.faceLandmark68Net.loadFromDisk("./models")
await faceapi.nets.faceRecognitionNet.loadFromDisk("./models")

// Détecter le visage
const detection = await faceapi.detectSingleFace(image)
  .withFaceLandmarks()
  .withFaceDescriptor()

// Comparer deux visages
const distance = faceapi.euclideanDistance(descriptor1, descriptor2)
const match = distance < 0.6
```

---

## 9. shadcn/ui

### Pourquoi shadcn/ui ?
- **Composants accessibles** basés sur Radix UI
- **Personnalisables** (source dans le projet)
- **TailwindCSS** intégré

### Installation
```bash
npx shadcn-ui@latest add button card input table
```

### Utilisation
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>Titre</CardHeader>
      <CardContent>
        <Button variant="default">Action</Button>
      </CardContent>
    </Card>
  )
}
```

---

## 10. React-PDF

### Pourquoi React-PDF ?
- Génération de **documents PDF** côté client
- Support des **images** et **styles**

### Utilisation
```tsx
import { Document, Page, Text, View, PDFDownloadLink } from "@react-pdf/renderer"

const CitizenCard = ({ citizen }) => (
  <Document>
    <Page size="A4">
      <View>
        <Text>{citizen.firstName} {citizen.lastName}</Text>
        <Text>ID: {citizen.nationalityID}</Text>
      </View>
    </Page>
  </Document>
)

// Bouton de téléchargement
<PDFDownloadLink document={<CitizenCard citizen={data} />} fileName="carte-identite.pdf">
  Télécharger
</PDFDownloadLink>
```

---

## Tableau Récapitulatif

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 14.0.4 | Framework fullstack |
| React | 18.3.1 | UI Components |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| PostgreSQL | 16.x | Base de données |
| NextAuth.js | 4.x | Authentification |
| Argon2 | 0.31.x | Hachage mots de passe |
| otplib | 12.x | MFA/TOTP |
| Face-API.js | 0.22.2 | Biométrie faciale |
| TailwindCSS | 3.x | Styling |
| shadcn/ui | latest | UI Components |
| React-PDF | 3.x | Génération PDF |
