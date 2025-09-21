-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MEDECIN', 'PROCUREUR', 'OPJ', 'OFFICIER_ETAT_CIVIL', 'CITOYEN');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Nationality" AS ENUM ('NATIONAL', 'FOREIGN');

-- CreateEnum
CREATE TYPE "public"."EthnicGroup" AS ENUM ('GROUP_A', 'GROUP_B');

-- CreateEnum
CREATE TYPE "public"."BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "public"."ComplaintStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."SentenceType" AS ENUM ('IMPRISONMENT', 'FINE', 'COMMUNITY_SERVICE');

-- CreateEnum
CREATE TYPE "public"."ParoleStatus" AS ENUM ('ELIGIBLE', 'GRANTED', 'DENIED');

-- CreateEnum
CREATE TYPE "public"."RehabilitationStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."AppealStatus" AS ENUM ('NONE', 'PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."MarriageType" AS ENUM ('CIVIL', 'RELIGIOUS', 'TRADITIONAL');

-- CreateEnum
CREATE TYPE "public"."ContractType" AS ENUM ('COMMUNITY_PROPERTY', 'SEPARATION_OF_PROPERTY');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "roles" "public"."Role"[],
    "accountNonExpired" BOOLEAN NOT NULL DEFAULT true,
    "accountNonLocked" BOOLEAN NOT NULL DEFAULT true,
    "credentialsNonExpired" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "isUsing2FA" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."citizens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "maidenName" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "nationalityID" TEXT NOT NULL,
    "nationality" "public"."Nationality" NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "ethnicGroup" "public"."EthnicGroup",
    "community" TEXT,
    "territory" TEXT,
    "fatherId" TEXT,
    "motherId" TEXT,
    "currentAddress" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "bloodType" "public"."BloodType",
    "disabilities" TEXT,
    "educationLevel" TEXT,
    "profession" TEXT,
    "maritalStatus" "public"."MaritalStatus" NOT NULL DEFAULT 'SINGLE',
    "occupation" TEXT,
    "religion" TEXT,
    "voterStatus" TEXT,
    "taxIdentificationNumber" TEXT,
    "socialSecurityNumber" TEXT,
    "drivingLicenseNumber" TEXT,
    "passportNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."images" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "citizenId" TEXT,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."birth_records" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "officiantId" TEXT NOT NULL,
    "declarerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "place" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "birthTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birth_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."marriage_records" (
    "id" TEXT NOT NULL,
    "partner1Id" TEXT NOT NULL,
    "partner2Id" TEXT NOT NULL,
    "marriagePlace" TEXT NOT NULL,
    "marriageDate" TIMESTAMP(3) NOT NULL,
    "officiantId" TEXT NOT NULL,
    "witness1Id" TEXT NOT NULL,
    "witness2Id" TEXT NOT NULL,
    "witness3Id" TEXT,
    "marriageType" "public"."MarriageType" NOT NULL,
    "contractType" "public"."ContractType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marriage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."death_records" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "deathPlace" TEXT NOT NULL,
    "deathDate" TIMESTAMP(3) NOT NULL,
    "declarerId" TEXT NOT NULL,
    "officiantId" TEXT NOT NULL,
    "informantRelationship" TEXT NOT NULL,
    "funeralPlace" TEXT,
    "cemeteryName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "death_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consultations" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "notes" TEXT,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prescriptions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dosage" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "consultationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medications" (
    "id" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "adminRoute" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."complaints" (
    "id" TEXT NOT NULL,
    "plaintiffId" TEXT NOT NULL,
    "accusedId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "public"."ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "witnesses" TEXT,
    "evidence" TEXT,
    "policeOfficerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."convictions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jurisdiction" TEXT NOT NULL,
    "court" TEXT NOT NULL,
    "offenseNature" TEXT NOT NULL,
    "duration" TEXT,
    "fineAmount" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sentenceType" "public"."SentenceType" NOT NULL,
    "paroleStatus" "public"."ParoleStatus",
    "rehabilitationStatus" "public"."RehabilitationStatus",
    "appealStatus" "public"."AppealStatus" NOT NULL DEFAULT 'NONE',
    "citizenId" TEXT NOT NULL,
    "prosecutorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webauthn_credentials" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."face_descriptors" (
    "id" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "descriptor" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "face_descriptors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_MedicationToPrescription" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MedicationToPrescription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "citizens_userId_key" ON "public"."citizens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "citizens_nationalityID_key" ON "public"."citizens"("nationalityID");

-- CreateIndex
CREATE UNIQUE INDEX "birth_records_registrationNumber_key" ON "public"."birth_records"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "birth_records_citizenId_key" ON "public"."birth_records"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "death_records_citizenId_key" ON "public"."death_records"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_credentialId_key" ON "public"."webauthn_credentials"("credentialId");

-- CreateIndex
CREATE INDEX "_MedicationToPrescription_B_index" ON "public"."_MedicationToPrescription"("B");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citizens" ADD CONSTRAINT "citizens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citizens" ADD CONSTRAINT "citizens_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "public"."citizens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citizens" ADD CONSTRAINT "citizens_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "public"."citizens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."images" ADD CONSTRAINT "images_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_records" ADD CONSTRAINT "birth_records_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_records" ADD CONSTRAINT "birth_records_officiantId_fkey" FOREIGN KEY ("officiantId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_records" ADD CONSTRAINT "birth_records_declarerId_fkey" FOREIGN KEY ("declarerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marriage_records" ADD CONSTRAINT "marriage_records_partner1Id_fkey" FOREIGN KEY ("partner1Id") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marriage_records" ADD CONSTRAINT "marriage_records_partner2Id_fkey" FOREIGN KEY ("partner2Id") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marriage_records" ADD CONSTRAINT "marriage_records_officiantId_fkey" FOREIGN KEY ("officiantId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marriage_records" ADD CONSTRAINT "marriage_records_witness1Id_fkey" FOREIGN KEY ("witness1Id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marriage_records" ADD CONSTRAINT "marriage_records_witness2Id_fkey" FOREIGN KEY ("witness2Id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."marriage_records" ADD CONSTRAINT "marriage_records_witness3Id_fkey" FOREIGN KEY ("witness3Id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."death_records" ADD CONSTRAINT "death_records_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."death_records" ADD CONSTRAINT "death_records_declarerId_fkey" FOREIGN KEY ("declarerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."death_records" ADD CONSTRAINT "death_records_officiantId_fkey" FOREIGN KEY ("officiantId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultations" ADD CONSTRAINT "consultations_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prescriptions" ADD CONSTRAINT "prescriptions_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "public"."consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_plaintiffId_fkey" FOREIGN KEY ("plaintiffId") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_accusedId_fkey" FOREIGN KEY ("accusedId") REFERENCES "public"."citizens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_policeOfficerId_fkey" FOREIGN KEY ("policeOfficerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."convictions" ADD CONSTRAINT "convictions_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."convictions" ADD CONSTRAINT "convictions_prosecutorId_fkey" FOREIGN KEY ("prosecutorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."face_descriptors" ADD CONSTRAINT "face_descriptors_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."citizens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MedicationToPrescription" ADD CONSTRAINT "_MedicationToPrescription_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_MedicationToPrescription" ADD CONSTRAINT "_MedicationToPrescription_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
