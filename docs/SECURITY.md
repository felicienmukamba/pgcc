# 🔐 Architecture de Sécurité — PGCC

Ce document détaille l'implémentation de la sécurité de grade gouvernemental dans le système PGCC.

---

## 1. Séparation Identité / Profil

Le système sépare strictement les données d'authentification des informations personnelles (PII) :

### CitizenIdentity (Table d'authentification)
```prisma
model CitizenIdentity {
  id            String   @id @default(uuid())  // UUIDv7
  nationalId    String   @unique               // Validé par Verhoeff
  passwordHash  String                         // Argon2id
  mfaSecret     String?                        // Secret TOTP chiffré
  mfaEnabled    Boolean  @default(false)
}
```

### CitizenProfile (Table PII chiffrée)
```prisma
model CitizenProfile {
  identityId     String   @unique
  encryptedData  String   @db.Text  // AES-256-GCM
}
```

> **Principe** : Même en cas de brèche, les données d'authentification ne contiennent aucune information personnelle.

---

## 2. Chiffrement AES-256-GCM

**Fichier** : `lib/crypto.ts`

```typescript
// Chiffrement
export async function encrypt(text: string): Promise<string>

// Déchiffrement
export async function decrypt(encryptedText: string): Promise<string>
```

### Caractéristiques
- **Algorithme** : AES-256-GCM (Authenticated Encryption)
- **IV** : 12 bytes aléatoires par opération
- **Format de sortie** : Base64(IV + CipherText + AuthTag)

### Configuration
```env
ENCRYPTION_KEY="00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
```

> ⚠️ En production, utiliser un HSM (Hardware Security Module) ou AWS KMS.

---

## 3. Hachage Argon2id

**Fichier** : `lib/hashing.ts`

```typescript
// Hacher un mot de passe
export async function hashPassword(password: string): Promise<string>

// Vérifier un mot de passe
export async function verifyPassword(hash: string, password: string): Promise<boolean>
```

### Paramètres OWASP Recommandés
| Paramètre | Valeur |
|-----------|--------|
| Memory Cost | 64 MB |
| Time Cost | 3 itérations |
| Parallelism | 1 thread |

### Pourquoi Argon2id ?
- Résistance aux attaques GPU/ASIC (memory-hard)
- Vainqueur du Password Hashing Competition (PHC)
- Recommandé par OWASP et NIST

---

## 4. Validation Verhoeff

**Fichier** : `lib/identity.ts`

```typescript
// Valider un ID national
export function validateVerhoeff(num: string): boolean

// Générer un chiffre de contrôle
export function generateVerhoeff(num: string): string
```

### Utilisation
Le numéro d'identification national doit passer la validation Verhoeff avant d'être accepté :
- Détecte 100% des erreurs de transposition adjacente
- Détecte 100% des erreurs de substitution simple

---

## 5. Authentification Multi-Facteurs (MFA)

### Flux d'Enrôlement
```
1. Utilisateur demande l'activation MFA
2. Système génère un secret TOTP (32 caractères)
3. QR Code affiché pour Google Authenticator
4. Utilisateur entre le code pour confirmer
5. mfaEnabled = true
```

### Flux de Connexion avec MFA
```
1. Utilisateur entre National ID + Password
2. Système vérifie Argon2id hash
3. Si mfaEnabled:
   - Retourne { requireMfa: true, identityId }
   - Utilisateur entre le code TOTP
   - Système vérifie avec otplib
4. Session créée
```

---

## 6. Journal d'Audit Immutable (Modèle Estonien)

**Fichier** : `lib/audit.ts`

### Structure de la Chaîne
```
+----------------+     +----------------+     +----------------+
|   Log #1       |---->|   Log #2       |---->|   Log #3       |
| prevHash: GEN  |     | prevHash: H1   |     | prevHash: H2   |
| hash: H1       |     | hash: H2       |     | hash: H3       |
+----------------+     +----------------+     +----------------+
```

### Calcul du Hash
```typescript
const payload = `${prevHash}|${userId}|${action}|${entity}|${entityId}|${details}|${ip}|${timestamp}`
const hash = SHA256(payload)
```

### Vérification d'Intégrité
**API** : `GET /api/audit/verify-integrity`

Retourne :
```json
{
  "totalLogs": 1500,
  "compromisedCount": 0,
  "isIntact": true,
  "compromisedLogs": []
}
```

---

## 7. Flux de Données Sécurisé

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Utilisateur │    │   API       │    │   Base de   │
│  (Browser)   │    │   Routes    │    │   Données   │
└──────┬───────┘    └──────┬──────┘    └──────┬──────┘
       │                   │                  │
       │ 1. Register       │                  │
       │ (NatID + Password │                  │
       │  + PII)           │                  │
       │──────────────────>│                  │
       │                   │                  │
       │                   │ 2. Validate      │
       │                   │    Verhoeff      │
       │                   │                  │
       │                   │ 3. Hash Password │
       │                   │    (Argon2id)    │
       │                   │                  │
       │                   │ 4. Encrypt PII   │
       │                   │    (AES-256)     │
       │                   │                  │
       │                   │ 5. Store         │
       │                   │──────────────────>
       │                   │                  │
       │                   │ 6. Log Action    │
       │                   │    (Hash Chain)  │
       │<──────────────────│                  │
       │ 7. Success        │                  │
```

---

## 8. Recommandations Production

| Élément | Développement | Production |
|---------|---------------|------------|
| ENCRYPTION_KEY | .env | AWS KMS / HashiCorp Vault |
| Database | PostgreSQL local | RDS avec SSL forcé |
| Sessions | Cookie simple | Redis cluster |
| Rate Limiting | Désactivé | Cloudflare / AWS WAF |
| Logs | Console | CloudWatch / Datadog |
