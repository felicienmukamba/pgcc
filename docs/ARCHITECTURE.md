# 🏗️ Architecture Système — PGCC

## Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              NAVIGATEUR WEB                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Landing     │  │ Login/MFA   │  │ Dashboard   │  │ Audit Integrity    │ │
│  │ Page        │  │ Pages       │  │ Routes      │  │ Verification       │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└──────────────────────────────▲───────────────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                           NEXT.JS SERVER                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                         MIDDLEWARE                                      ││
│  │  • Authentication Check (NextAuth)                                      ││
│  │  • RBAC Verification                                                    ││
│  └──────────────────────────────────────────────────▲──────────────────────┘│
│                                                     │                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────▼────────┐              │
│  │ API Routes      │  │ Server Actions  │  │ Server         │              │
│  │ /api/*          │  │                 │  │ Components     │              │
│  └────────┬────────┘  └────────┬────────┘  └────────────────┘              │
│           │                    │                                            │
│  ┌────────▼────────────────────▼────────────────────────────────────────┐  │
│  │                      SECURITY LAYER                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │  │
│  │  │ AES-256-GCM  │  │ Argon2id    │  │ SHA-256      │               │  │
│  │  │ (Encryption) │  │ (Hashing)   │  │ (Audit Hash) │               │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        PRISMA ORM                                    │  │
│  └──────────────────────────────▲───────────────────────────────────────┘  │
└──────────────────────────────────│───────────────────────────────────────────┘
                                   │ TCP/SSL
┌──────────────────────────────────▼───────────────────────────────────────────┐
│                           POSTGRESQL                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ CitizenIdentity │  │ CitizenProfile  │  │ AuditLog                    │  │
│  │ (Auth Only)     │  │ (Encrypted PII) │  │ (Hash Chain)                │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Flux d'Authentification

### 1. Enregistrement Citoyen

```
Client                    API                         Database
  │                        │                             │
  │ POST /register-citizen │                             │
  │ {nationalId, password, │                             │
  │  PII data}             │                             │
  │───────────────────────>│                             │
  │                        │                             │
  │                        │ 1. Validate Verhoeff        │
  │                        │ 2. Hash password (Argon2id) │
  │                        │ 3. Encrypt PII (AES-256)    │
  │                        │                             │
  │                        │ INSERT CitizenIdentity      │
  │                        │────────────────────────────>│
  │                        │                             │
  │                        │ INSERT CitizenProfile       │
  │                        │────────────────────────────>│
  │                        │                             │
  │                        │ INSERT AuditLog (CREATE)    │
  │                        │────────────────────────────>│
  │                        │                             │
  │<───────────────────────│                             │
  │ { success: true }      │                             │
```

### 2. Connexion avec MFA

```
Client                    API                         Database
  │                        │                             │
  │ POST /login-citizen    │                             │
  │ {nationalId, password} │                             │
  │───────────────────────>│ SELECT CitizenIdentity      │
  │                        │────────────────────────────>│
  │                        │<────────────────────────────│
  │                        │                             │
  │                        │ Verify Argon2id             │
  │                        │                             │
  │ { requireMfa: true }   │ If mfaEnabled:              │
  │<───────────────────────│                             │
  │                        │                             │
  │ POST /mfa/verify       │                             │
  │ {identityId, token}    │                             │
  │───────────────────────>│ TOTP.verify(secret, token)  │
  │                        │                             │
  │<───────────────────────│                             │
  │ { success, session }   │                             │
```

---

## Modèle de Données

```
┌───────────────────┐       ┌───────────────────┐
│  CitizenIdentity  │       │  CitizenProfile   │
├───────────────────┤       ├───────────────────┤
│ id          UUID  │───────│ identityId   FK   │
│ nationalId  STR   │       │ encryptedData TXT │
│ passwordHash STR  │       │ emailHash    STR? │
│ mfaSecret   STR?  │       └───────────────────┘
│ mfaEnabled  BOOL  │
└───────────────────┘
         │
         ▼
┌───────────────────┐
│     AuditLog      │
├───────────────────┤
│ id        CUID    │
│ userId    FK      │
│ action    STR     │
│ entity    STR     │
│ entityId  STR?    │
│ details   STR?    │
│ prevHash  STR?    │──┐ Hash Chain
│ hash      STR?    │──┘
└───────────────────┘
```

---

## Contrôle d'Accès (RBAC)

| Rôle | Citoyens | État Civil | Médical | Judiciaire | Audit |
|------|----------|------------|---------|------------|-------|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| OFFICIER_ETAT_CIVIL | ✅ | ✅ | ❌ | ❌ | ❌ |
| MEDECIN | 👁️ | ❌ | ✅ | ❌ | ❌ |
| PROCUREUR | 👁️ | ❌ | ❌ | ✅ | ❌ |
| OPJ | 👁️ | ❌ | ❌ | ✅ | ❌ |
| CITOYEN | 👤 | ❌ | ❌ | ❌ | ❌ |

Legend: ✅ Full Access | 👁️ Read Only | 👤 Own Record | ❌ No Access

---

## Déploiement

### Développement
```bash
pnpm dev     # Hot reload sur port 3000
```

### Production
```bash
pnpm build   # Compilation optimisée
pnpm start   # Serveur de production
```

### Docker (Recommandé)
```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - ENCRYPTION_KEY=...
  
  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
```
