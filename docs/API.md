# 📡 API Reference — PGCC

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

### POST `/auth/register-citizen`
Enregistre un nouveau citoyen avec chiffrement des données personnelles.

**Request Body:**
```json
{
  "nationalId": "123456789012",
  "password": "SecurePassword123!",
  "firstName": "Jean",
  "lastName": "Kabila",
  "email": "jean.kabila@gov.cd",
  "phoneNumber": "+243123456789",
  "birthDate": "1990-05-15",
  "address": "123 Avenue de la Paix, Kinshasa"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Citizen Identity Securely Created",
  "identityId": "uuid-v7-here"
}
```

**Errors:**
- `400` - Invalid National ID Checksum (Verhoeff)
- `409` - Identity already registered

---

### POST `/auth/login-citizen`
Authentifie un citoyen.

**Request Body:**
```json
{
  "nationalId": "123456789012",
  "password": "SecurePassword123!"
}
```

**Response (200) - Without MFA:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "nationalId": "123456789012"
  }
}
```

**Response (200) - With MFA:**
```json
{
  "requireMfa": true,
  "identityId": "uuid-here",
  "message": "MFA Required"
}
```

---

### POST `/auth/mfa/enroll`
Initie l'enrôlement MFA pour un citoyen.

**Request Body:**
```json
{
  "identityId": "uuid-here"
}
```

**Response (200):**
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/Gov-Citizen%20National%20ID:123...?secret=...",
  "message": "Scan QR code with your authenticator app"
}
```

---

### POST `/auth/mfa/verify`
Vérifie un code TOTP.

**Request Body:**
```json
{
  "identityId": "uuid-here",
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "MFA verified successfully"
}
```

---

## Profile

### GET `/profile/decrypt?identityId=uuid`
Récupère et déchiffre le profil d'un citoyen.

**Headers:**
```
Authorization: Bearer <session-token>
```

**Response (200):**
```json
{
  "nationalId": "123456789012",
  "mfaEnabled": true,
  "firstName": "Jean",
  "lastName": "Kabila",
  "email": "jean.kabila@gov.cd",
  "phoneNumber": "+243123456789",
  "birthDate": "1990-05-15",
  "address": "123 Avenue de la Paix, Kinshasa"
}
```

---

## Audit

### GET `/audit/verify-integrity`
Vérifie l'intégrité de la chaîne de hachage des logs d'audit.

**Authorization:** ADMIN only

**Response (200):**
```json
{
  "totalLogs": 1500,
  "compromisedCount": 0,
  "isIntact": true,
  "compromisedLogs": []
}
```

**Response avec compromission:**
```json
{
  "totalLogs": 1500,
  "compromisedCount": 2,
  "isIntact": false,
  "compromisedLogs": [
    {
      "id": "clu123abc",
      "reason": "Hash mismatch - Log may have been tampered with",
      "expectedHash": "a1b2c3...",
      "actualHash": "d4e5f6..."
    }
  ]
}
```

---

## Citizens

### GET `/citizens`
Liste les citoyens avec pagination.

**Query Params:**
- `page` (default: 1)
- `search` (optional)
- `gender` (optional: MALE|FEMALE|OTHER)
- `status` (optional: SINGLE|MARRIED|DIVORCED|WIDOWED)

**Response (200):**
```json
{
  "citizens": [...],
  "totalPages": 10,
  "currentPage": 1
}
```

### GET `/citizens/:id`
Détails d'un citoyen spécifique.

### POST `/citizens`
Crée un nouveau citoyen (legacy flow).

### PUT `/citizens/:id`
Met à jour un citoyen.

### DELETE `/citizens/:id`
Supprime un citoyen (ADMIN only).

---

## Error Responses

All endpoints may return:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

| Status | Description |
|--------|-------------|
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/*` | 5 requests/minute |
| `/api/*` | 100 requests/minute |
| `/audit/*` | 10 requests/minute |
