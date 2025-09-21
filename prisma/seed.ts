import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  Gender,
  Nationality,
  MaritalStatus,
  MarriageType,
  ContractType,
  ComplaintStatus,
  SentenceType,
  RehabilitationStatus,
  AppealStatus,
  ParoleStatus,
  BloodType,
  EthnicGroup,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du processus de seed...");

  // --- 0. Nettoyage des tables dans le bon ordre pour éviter les erreurs de clé étrangère ---
  await prisma.prescription.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.conviction.deleteMany();
  await prisma.birthRecord.deleteMany();
  await prisma.marriageRecord.deleteMany();
  await prisma.deathRecord.deleteMany();
  await prisma.faceDescriptor.deleteMany();
  await prisma.image.deleteMany();
  await prisma.citizen.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Tables nettoyées.");

  // === 1. USERS & CITOYENS ===
  console.log("👥 Création des utilisateurs et des citoyens...");

  const hashedPassword = await bcrypt.hash("password", 10);

  // --- Création des utilisateurs pour les rôles de l'application ---
  const adminUser = await prisma.user.create({ data: { email: "admin@gov.local", username: "admin", roles: [Role.ADMIN] } });
  await prisma.account.create({ data: { userId: adminUser.id, type: "credentials", provider: "credentials", providerAccountId: adminUser.email, access_token: hashedPassword } });

  const officierEtatCivilUser = await prisma.user.create({ data: { email: "officier@gov.local", username: "officier", roles: [Role.OFFICIER_ETAT_CIVIL] } });
  await prisma.account.create({ data: { userId: officierEtatCivilUser.id, type: "credentials", provider: "credentials", providerAccountId: officierEtatCivilUser.email, access_token: hashedPassword } });

  const medecinUser = await prisma.user.create({ data: { email: "medecin@gov.local", username: "medecin", roles: [Role.MEDECIN] } });
  await prisma.account.create({ data: { userId: medecinUser.id, type: "credentials", provider: "credentials", providerAccountId: medecinUser.email, access_token: hashedPassword } });

  const opjUser = await prisma.user.create({ data: { email: "opj@gov.local", username: "opj", roles: [Role.OPJ] } });
  await prisma.account.create({ data: { userId: opjUser.id, type: "credentials", provider: "credentials", providerAccountId: opjUser.email, access_token: hashedPassword } });

  const procureurUser = await prisma.user.create({ data: { email: "procureur@gov.local", username: "procureur", roles: [Role.PROCUREUR] } });
  await prisma.account.create({ data: { userId: procureurUser.id, type: "credentials", provider: "credentials", providerAccountId: procureurUser.email, access_token: hashedPassword } });

  // --- Création d'utilisateurs dédiés pour chaque citoyen afin de respecter la contrainte @unique ---
  const pereUser = await prisma.user.create({ data: { email: "papa.mbiya@gov.local", username: "papam", roles: [Role.CITOYEN] } });
  await prisma.account.create({ data: { userId: pereUser.id, type: "credentials", provider: "credentials", providerAccountId: pereUser.email, access_token: hashedPassword } });

  const mereUser = await prisma.user.create({ data: { email: "maman.nkosi@gov.local", username: "mamann", roles: [Role.CITOYEN] } });
  await prisma.account.create({ data: { userId: mereUser.id, type: "credentials", provider: "credentials", providerAccountId: mereUser.email, access_token: hashedPassword } });

  const enfant1User = await prisma.user.create({ data: { email: "jean.mbiya@gov.local", username: "jeanm", roles: [Role.CITOYEN] } });
  await prisma.account.create({ data: { userId: enfant1User.id, type: "credentials", provider: "credentials", providerAccountId: enfant1User.email, access_token: hashedPassword } });

  const enfant2User = await prisma.user.create({ data: { email: "marie.mbiya@gov.local", username: "mariem", roles: [Role.CITOYEN] } });
  await prisma.account.create({ data: { userId: enfant2User.id, type: "credentials", provider: "credentials", providerAccountId: enfant2User.email, access_token: hashedPassword } });

  const decapitaineUser = await prisma.user.create({ data: { email: "papa.decapitaine@gov.local", username: "decapitaine", roles: [Role.CITOYEN] } });
  await prisma.account.create({ data: { userId: decapitaineUser.id, type: "credentials", provider: "credentials", providerAccountId: decapitaineUser.email, access_token: hashedPassword } });

  const victimeUser = await prisma.user.create({ data: { email: "paule.mavungu@gov.local", username: "paulem", roles: [Role.CITOYEN] } });
  await prisma.account.create({ data: { userId: victimeUser.id, type: "credentials", provider: "credentials", providerAccountId: victimeUser.email, access_token: hashedPassword } });
  
  const agresseurUser = await prisma.user.create({ data: { email: "patrick.lwanga@gov.local", username: "patricklw", roles: [Role.CITOYEN] } });
  await prisma.account.create({ data: { userId: agresseurUser.id, type: "credentials", provider: "credentials", providerAccountId: agresseurUser.email, access_token: hashedPassword } });


  // Création des citoyens principaux pour les relations
  const pere = await prisma.citizen.create({
    data: {
      userId: pereUser.id,
      firstName: "Papa",
      lastName: "Mbiya",
      birthDate: new Date("1980-05-15"),
      birthPlace: "Kinshasa",
      nationalityID: "1980-05-15-CD-MBIYA",
      nationality: Nationality.NATIONAL,
      gender: Gender.MALE,
      ethnicGroup: EthnicGroup.GROUP_A,
      community: "Kongo",
      territory: "Kinshasa",
      currentAddress: "15 Rue de l'Indépendance, Kinshasa",
      phoneNumber: "+243812345678",
      emergencyContactName: "Maman Nkosi",
      emergencyContactPhone: "+243818765432",
      bloodType: BloodType.O_POSITIVE,
      educationLevel: "Universitaire",
      profession: "Ingénieur",
      maritalStatus: MaritalStatus.MARRIED,
      occupation: "Secteur privé",
      religion: "Chrétien",
      voterStatus: "Enregistré",
      taxIdentificationNumber: "TIN123456789",
      socialSecurityNumber: "SSN987654321",
      drivingLicenseNumber: "DRL12345",
      passportNumber: "PAS123456",
    },
  });

  const mere = await prisma.citizen.create({
    data: {
      userId: mereUser.id,
      firstName: "Maman",
      lastName: "Nkosi",
      maidenName: "Kalala",
      birthDate: new Date("1982-08-20"),
      birthPlace: "Lubumbashi",
      nationalityID: "1982-08-20-CD-NKOSI",
      nationality: Nationality.NATIONAL,
      gender: Gender.FEMALE,
      ethnicGroup: EthnicGroup.GROUP_B,
      community: "Luba",
      territory: "Lubumbashi",
      currentAddress: "15 Rue de l'Indépendance, Kinshasa",
      phoneNumber: "+243818765432",
      emergencyContactName: "Papa Mbiya",
      emergencyContactPhone: "+243812345678",
      bloodType: BloodType.A_POSITIVE,
      educationLevel: "Universitaire",
      profession: "Médecin",
      maritalStatus: MaritalStatus.MARRIED,
      occupation: "Secteur public",
      religion: "Chrétien",
      voterStatus: "Enregistré",
      taxIdentificationNumber: "TIN987654321",
      socialSecurityNumber: "SSN123456789",
      drivingLicenseNumber: "DRL54321",
      passportNumber: "PAS654321",
    },
  });

  const enfant1 = await prisma.citizen.create({
    data: {
      userId: enfant1User.id,
      firstName: "Jean",
      lastName: "Mbiya",
      birthDate: new Date("2005-11-25"),
      birthPlace: "Kinshasa",
      nationalityID: "2005-11-25-CD-MBIYA",
      nationality: Nationality.NATIONAL,
      gender: Gender.MALE,
      fatherId: pere.id,
      motherId: mere.id,
      currentAddress: "15 Rue de l'Indépendance, Kinshasa",
      ethnicGroup: EthnicGroup.GROUP_A,
      educationLevel: "Lycée",
      profession: "Étudiant",
      maritalStatus: MaritalStatus.SINGLE,
      bloodType: BloodType.O_POSITIVE,
      voterStatus: "Non enregistré",
    },
  });

  const enfant2 = await prisma.citizen.create({
    data: {
      userId: enfant2User.id,
      firstName: "Marie",
      lastName: "Mbiya",
      birthDate: new Date("2010-02-14"),
      birthPlace: "Kinshasa",
      nationalityID: "2010-02-14-CD-MBIYA",
      nationality: Nationality.NATIONAL,
      gender: Gender.FEMALE,
      fatherId: pere.id,
      motherId: mere.id,
      currentAddress: "15 Rue de l'Indépendance, Kinshasa",
      ethnicGroup: EthnicGroup.GROUP_A,
      educationLevel: "Lycée",
      profession: "Étudiant",
      maritalStatus: MaritalStatus.SINGLE,
      bloodType: BloodType.A_POSITIVE,
      voterStatus: "Non enregistré",
    },
  });
  
  const decapitaine = await prisma.citizen.create({
    data: {
      userId: decapitaineUser.id,
      firstName: "Papa",
      lastName: "Decapitaine",
      birthDate: new Date("1960-01-01"),
      birthPlace: "Kisangani",
      nationalityID: "1960-01-01-CD-DECAPITAINE",
      nationality: Nationality.NATIONAL,
      gender: Gender.MALE,
      currentAddress: "15 Rue de l'Indépendance",
      maritalStatus: MaritalStatus.WIDOWED,
    },
  });

  const victime = await prisma.citizen.create({
    data: {
      userId: victimeUser.id,
      firstName: "Paule",
      lastName: "Mavungu",
      birthDate: new Date("1995-04-30"),
      birthPlace: "Mbuji-Mayi",
      nationalityID: "1995-04-30-CD-MAVUNGU",
      nationality: Nationality.NATIONAL,
      gender: Gender.FEMALE,
      currentAddress: "22 Rue du Fleuve",
      maritalStatus: MaritalStatus.SINGLE,
    },
  });
  
  const agresseur = await prisma.citizen.create({
    data: {
      userId: agresseurUser.id,
      firstName: "Patrick",
      lastName: "Lwanga",
      birthDate: new Date("1993-07-22"),
      birthPlace: "Kinshasa",
      nationalityID: "1993-07-22-CD-LWANGA",
      nationality: Nationality.NATIONAL,
      gender: Gender.MALE,
      currentAddress: "99 Avenue de la Paix",
      maritalStatus: MaritalStatus.SINGLE,
    },
  });

  console.log("✅ Utilisateurs et citoyens créés.");

  // --- Relations Parentales
  await prisma.citizen.update({
    where: { id: enfant1.id },
    data: { fatherId: pere.id, motherId: mere.id },
  });
  await prisma.citizen.update({
    where: { id: enfant2.id },
    data: { fatherId: pere.id, motherId: mere.id },
  });

  console.log("📝 Création des actes d'état civil...");

  // === 2. ACTES DE NAISSANCE ===
  const acteNaissance1 = await prisma.birthRecord.create({
    data: {
      registrationNumber: "BIRTH-KIN-2005-12345",
      citizenId: enfant1.id,
      officiantId: officierEtatCivilUser.id,
      declarerId: pere.id, 
      date: new Date("2005-11-27"),
      place: "Hôpital Général de Référence de Kinshasa",
      childName: enfant1.firstName + " " + enfant1.lastName,
      gender: enfant1.gender,
      birthDate: enfant1.birthDate,
      birthPlace: enfant1.birthPlace,
      weight: 3.2,
      height: 50.5,
      birthTime: "14:30",
      observations: "Déclaration faite par le père, en présence de la mère.",
    },
  });
  
  const acteNaissance2 = await prisma.birthRecord.create({
    data: {
      registrationNumber: "BIRTH-KIN-2010-67890",
      citizenId: enfant2.id,
      officiantId: officierEtatCivilUser.id,
      declarerId: mere.id, 
      date: new Date("2010-02-16"),
      place: "Hôpital de la Gombe",
      childName: enfant2.firstName + " " + enfant2.lastName,
      gender: enfant2.gender,
      birthDate: enfant2.birthDate,
      birthPlace: enfant2.birthPlace,
      weight: 2.9,
      height: 48,
      birthTime: "08:10",
      observations: "Naissance par césarienne.",
    },
  });

  console.log("✅ Actes de naissance créés.");


  console.log("💍 Création des actes de mariage...");
  
  const mariage = await prisma.marriageRecord.create({
    data: {
      partner1Id: pere.id,
      partner2Id: mere.id,
      marriagePlace: "Mairie de Kinshasa",
      marriageDate: new Date("2003-07-05"),
      officiantId: officierEtatCivilUser.id,
      witness1Id: enfant1.id,
      witness2Id: enfant2.id,
      marriageType: MarriageType.CIVIL,
      contractType: ContractType.COMMUNITY_PROPERTY,
    },
  });
  console.log("✅ Actes de mariage créés.");
  

  console.log("⚰️ Création des actes de décès...");

  const deces = await prisma.deathRecord.create({
    data: {
      citizenId: decapitaine.id,
      deathDate: new Date("2024-05-10"),
      deathPlace: "Hôpital de la Gombe",
      declarerId: mere.id, 
      officiantId: officierEtatCivilUser.id,
      informantRelationship: "Fils", // Assuming 'mere' is related to 'decapitaine'
      funeralPlace: "Cimetière de Kinshasa",
    },
  });
  console.log("✅ Actes de décès créés.");


  // --- 3. INFOS MÉDICALES ET LÉGALES ---
  console.log("🩺 Création des consultations, prescriptions et médicaments...");
  const consultation = await prisma.consultation.create({
    data: {
      date: new Date("2025-01-10T10:00:00Z"),
      diagnosis: "Grippe saisonnière",
      price: 25000,
      duration: "30 minutes",
      notes: "Forte fièvre, toux et courbatures. Prescription d'antibiotiques et de repos.",
      doctorId: medecinUser.id,
      patientId: enfant1.id,
    },
  });

  const medicationsData = [
    { tradeName: "Doliprane", genericName: "Paracétamol", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi-Aventis", description: "Médicament analgésique et antipyrétique." },
    { tradeName: "Efferalgan", genericName: "Paracétamol", dosage: "1000 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "UPSA", description: "Traitement symptomatique des douleurs et de la fièvre." },
    { tradeName: "Ibuprofène", genericName: "Ibuprofène", dosage: "200 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Anti-inflammatoire non stéroïdien (AINS)." },
    { tradeName: "Spedifen", genericName: "Ibuprofène", dosage: "400 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Zambon France", description: "Traitement de courte durée des douleurs et de la fièvre." },
    { tradeName: "Aspirine", genericName: "Acide acétylsalicylique", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Bayer", description: "Antalgique, antipyrétique, anti-inflammatoire." },
    { tradeName: "Amoxicilline", genericName: "Amoxicilline", dosage: "500 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique de la famille des pénicillines." },
    { tradeName: "Augmentin", genericName: "Amoxicilline/Acide clavulanique", dosage: "500 mg/62.5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "GlaxoSmithKline", description: "Antibiotique à large spectre." },
    { tradeName: "Clarithromycine", genericName: "Clarithromycine", dosage: "250 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique de la famille des macrolides." },
    { tradeName: "Ceftriaxone", genericName: "Ceftriaxone", dosage: "1 g", unit: "flacon", adminRoute: "Intramusculaire/Intraveineuse", manufacturer: "Divers", description: "Antibiotique céphalosporine de troisième génération." },
    { tradeName: "Zithromax", genericName: "Azithromycine", dosage: "250 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Antibiotique de la famille des macrolides." },
    { tradeName: "Oméprazole", genericName: "Oméprazole", dosage: "20 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Divers", description: "Inhibiteur de la pompe à protons (IPP)." },
    { tradeName: "Mopral", genericName: "Oméprazole", dosage: "20 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "AstraZeneca", description: "Traitement des ulcères et du reflux gastro-œsophagien." },
    { tradeName: "Pantoprazole", genericName: "Pantoprazole", dosage: "40 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Inhibiteur de la pompe à protons (IPP)." },
    { tradeName: "Spironolactone", genericName: "Spironolactone", dosage: "25 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Diurétique épargneur de potassium." },
    { tradeName: "Lasix", genericName: "Furosémide", dosage: "40 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Diurétique puissant pour le traitement de l'œdème." },
    { tradeName: "Hydrochlorothiazide", genericName: "Hydrochlorothiazide", dosage: "25 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Diurétique thiazidique." },
    { tradeName: "Lisinopril", genericName: "Lisinopril", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Inhibiteur de l'enzyme de conversion de l'angiotensine (IEC)." },
    { tradeName: "Zestril", genericName: "Lisinopril", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "AstraZeneca", description: "Médicament pour l'hypertension et l'insuffisance cardiaque." },
    { tradeName: "Ramipril", genericName: "Ramipril", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Inhibiteur de l'enzyme de conversion de l'angiotensine (IEC)." },
    { tradeName: "Cardiazem", genericName: "Diltiazem", dosage: "60 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Antagoniste calcique pour l'hypertension et l'angine de poitrine." },
    { tradeName: "Amlodipine", genericName: "Amlodipine", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antagoniste calcique pour l'hypertension." },
    { tradeName: "Vogalène", genericName: "Métopimazine", dosage: "15 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Takeda", description: "Médicament antiémétique pour les nausées et vomissements." },
    { tradeName: "Primpéran", genericName: "Métoclopramide", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Médicament prokinétique et antiémétique." },
    { tradeName: "Smecta", genericName: "Diosmectite", dosage: "3 g", unit: "sachet", adminRoute: "Oral", manufacturer: "Ipsen", description: "Traitement de la diarrhée." },
    { tradeName: "Imodium", genericName: "Lopéramide", dosage: "2 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Johnson & Johnson", description: "Médicament antidiarrhéique." },
    { tradeName: "Gaviscon", genericName: "Alginate de sodium", dosage: "500 mg", unit: "sachet", adminRoute: "Oral", manufacturer: "Reckitt Benckiser", description: "Traitement du reflux gastro-œsophagien." },
    { tradeName: "Maalox", genericName: "Hydroxyde d'aluminium/Hydroxyde de magnésium", dosage: "400 mg/400 mg", unit: "sachet", adminRoute: "Oral", manufacturer: "Sanofi", description: "Antiacide pour soulager les brûlures d'estomac." },
    { tradeName: "Lansoprazole", genericName: "Lansoprazole", dosage: "30 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Divers", description: "Inhibiteur de la pompe à protons (IPP)." },
    { tradeName: "Nexium", genericName: "Esoméprazole", dosage: "20 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "AstraZeneca", description: "IPP pour le traitement de l'oesophagite." },
    { tradeName: "Levothyrox", genericName: "Lévothyroxine sodique", dosage: "50 mcg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Merck", description: "Hormone thyroïdienne de synthèse." },
    { tradeName: "Synthroid", genericName: "Lévothyroxine sodique", dosage: "100 mcg", unit: "comprimé", adminRoute: "Oral", manufacturer: "AbbVie", description: "Traitement de l'hypothyroïdie." },
    { tradeName: "Metformine", genericName: "Metformine", dosage: "850 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antidiabétique oral." },
    { tradeName: "Glucophage", genericName: "Metformine", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Merck", description: "Traitement du diabète de type 2." },
    { tradeName: "Insuline", genericName: "Insuline humaine", dosage: "100 UI/ml", unit: "flacon", adminRoute: "Sous-cutanée", manufacturer: "Divers", description: "Hormone régulant la glycémie." },
    { tradeName: "Novolog", genericName: "Insuline Aspart", dosage: "100 U/ml", unit: "cartouche", adminRoute: "Sous-cutanée", manufacturer: "Novo Nordisk", description: "Insuline à action rapide." },
    { tradeName: "Ventoline", genericName: "Salbutamol", dosage: "100 mcg", unit: "inhalateur", adminRoute: "Inhalation", manufacturer: "GlaxoSmithKline", description: "Bronchodilatateur pour l'asthme." },
    { tradeName: "Seretide", genericName: "Salmétérol/Fluticasone", dosage: "50/250 mcg", unit: "diskus", adminRoute: "Inhalation", manufacturer: "GlaxoSmithKline", description: "Traitement de fond de l'asthme et de la BPCO." },
    { tradeName: "Singulair", genericName: "Montélukast", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Merck", description: "Antagoniste des leucotriènes pour l'asthme." },
    { tradeName: "Zyrtec", genericName: "Cétirizine", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "UCB", description: "Antihistaminique pour les allergies." },
    { tradeName: "Loratadine", genericName: "Loratadine", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antihistaminique pour la rhinite allergique." },
    { tradeName: "Claritin", genericName: "Loratadine", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Bayer", description: "Médicament pour les symptômes d'allergie." },
    { tradeName: "Zopiclone", genericName: "Zopiclone", dosage: "7.5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Hypnotique pour le traitement de l'insomnie." },
    { tradeName: "Stilnox", genericName: "Zolpidem", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi-Aventis", description: "Hypnotique de courte durée d'action." },
    { tradeName: "Lexomil", genericName: "Bromazépam", dosage: "6 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Roche", description: "Anxiolytique de la famille des benzodiazépines." },
    { tradeName: "Valium", genericName: "Diazépam", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Roche", description: "Anxiolytique et myorelaxant." },
    { tradeName: "Xanax", genericName: "Alprazolam", dosage: "0.5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Anxiolytique pour les troubles anxieux et les attaques de panique." },
    { tradeName: "Prozac", genericName: "Fluoxétine", dosage: "20 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Eli Lilly", description: "Antidépresseur de type ISRS." },
    { tradeName: "Zoloft", genericName: "Sertraline", dosage: "50 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Antidépresseur de type ISRS." },
    { tradeName: "Tegretol", genericName: "Carbamazépine", dosage: "200 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Novartis", description: "Anticonvulsivant et stabilisateur de l'humeur." },
    { tradeName: "Depakine", genericName: "Valproate de sodium", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Anticonvulsivant et stabilisateur de l'humeur." },
    { tradeName: "Risperdal", genericName: "Rispéridone", dosage: "2 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Janssen", description: "Antipsychotique atypique." },
    { tradeName: "Seroquel", genericName: "Quétiapine", dosage: "50 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "AstraZeneca", description: "Antipsychotique pour le traitement de la schizophrénie et des troubles bipolaires." },
    { tradeName: "Singulair", genericName: "Montélukast", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Merck", description: "Antagoniste des leucotriènes pour l'asthme." },
    { tradeName: "Zyrtec", genericName: "Cétirizine", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "UCB", description: "Antihistaminique pour les allergies." },
    { tradeName: "Loratadine", genericName: "Loratadine", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antihistaminique pour la rhinite allergique." },
    { tradeName: "Claritin", genericName: "Loratadine", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Bayer", description: "Médicament pour les symptômes d'allergie." },
    { tradeName: "Zopiclone", genericName: "Zopiclone", dosage: "7.5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Hypnotique pour le traitement de l'insomnie." },
    { tradeName: "Stilnox", genericName: "Zolpidem", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi-Aventis", description: "Hypnotique de courte durée d'action." },
    { tradeName: "Lexomil", genericName: "Bromazépam", dosage: "6 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Roche", description: "Anxiolytique de la famille des benzodiazépines." },
    { tradeName: "Valium", genericName: "Diazépam", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Roche", description: "Anxiolytique et myorelaxant." },
    { tradeName: "Xanax", genericName: "Alprazolam", dosage: "0.5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Anxiolytique pour les troubles anxieux et les attaques de panique." },
    { tradeName: "Prozac", genericName: "Fluoxétine", dosage: "20 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Eli Lilly", description: "Antidépresseur de type ISRS." },
    { tradeName: "Zoloft", genericName: "Sertraline", dosage: "50 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Antidépresseur de type ISRS." },
    { tradeName: "Tegretol", genericName: "Carbamazépine", dosage: "200 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Novartis", description: "Anticonvulsivant et stabilisateur de l'humeur." },
    { tradeName: "Depakine", genericName: "Valproate de sodium", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Anticonvulsivant et stabilisateur de l'humeur." },
    { tradeName: "Risperdal", genericName: "Rispéridone", dosage: "2 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Janssen", description: "Antipsychotique atypique." },
    { tradeName: "Seroquel", genericName: "Quétiapine", dosage: "50 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "AstraZeneca", description: "Antipsychotique pour le traitement de la schizophrénie et des troubles bipolaires." },
    { tradeName: "Atorvastatine", genericName: "Atorvastatine", dosage: "20 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Médicament pour réduire le cholestérol." },
    { tradeName: "Lipitor", genericName: "Atorvastatine", dosage: "40 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Médicament pour les hypercholestérolémies." },
    { tradeName: "Metoprolol", genericName: "Métoprolol", dosage: "50 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Bêta-bloquant pour l'hypertension et l'angine de poitrine." },
    { tradeName: "Lopressor", genericName: "Métoprolol", dosage: "100 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Novartis", description: "Traitement des troubles du rythme cardiaque." },
    { tradeName: "Warfarin", genericName: "Warfarine", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Anticoagulant oral." },
    { tradeName: "Coumadin", genericName: "Warfarine", dosage: "2 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Bristol-Myers Squibb", description: "Traitement et prévention des thromboembolies." },
    { tradeName: "Plavix", genericName: "Clopidogrel", dosage: "75 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Antiagrégant plaquettaire." },
    { tradeName: "Selsun", genericName: "Sulfure de sélénium", dosage: "2.5%", unit: "lotion", adminRoute: "Topique", manufacturer: "Sanofi", description: "Traitement de la dermatite séborrhéique." },
    { tradeName: "Biafine", genericName: "Trolamine", dosage: "0.67%", unit: "émulsion", adminRoute: "Topique", manufacturer: "Johnson & Johnson", description: "Traitement des brûlures du premier et du second degré." },
    { tradeName: "Voltarène", genericName: "Diclofénac", dosage: "50 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Novartis", description: "Anti-inflammatoire non stéroïdien (AINS)." },
    { tradeName: "Tramadol", genericName: "Tramadol", dosage: "50 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Divers", description: "Antalgique de niveau II." },
    { tradeName: "Codéine", genericName: "Codéine", dosage: "30 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antalgique et antitussif." },
    { tradeName: "Morphine", genericName: "Morphine", dosage: "10 mg/ml", unit: "solution injectable", adminRoute: "Injectable", manufacturer: "Divers", description: "Antalgique opioïde puissant." },
    { tradeName: "Oxycodone", genericName: "Oxycodone", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antalgique opioïde." },
    { tradeName: "Naloxone", genericName: "Naloxone", dosage: "0.4 mg/ml", unit: "solution injectable", adminRoute: "Injectable", manufacturer: "Divers", description: "Antidote des surdoses d'opioïdes." },
    { tradeName: "Ativan", genericName: "Lorazépam", dosage: "1 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Anxiolytique pour les troubles anxieux." },
    { tradeName: "Ambien", genericName: "Zolpidem", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Hypnotique pour l'insomnie." },
    { tradeName: "Lexapro", genericName: "Escitalopram", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Allergan", description: "Antidépresseur de type ISRS." },
    { tradeName: "Cymbalta", genericName: "Duloxétine", dosage: "60 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Eli Lilly", description: "Antidépresseur et traitement de la douleur neuropathique." },
    { tradeName: "Gabapentine", genericName: "Gabapentine", dosage: "300 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Divers", description: "Anticonvulsivant et traitement de la douleur neuropathique." },
    { tradeName: "Lyrica", genericName: "Prégabaline", dosage: "75 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Pfizer", description: "Anticonvulsivant et traitement de la douleur neuropathique." },
    { tradeName: "Spiolto", genericName: "Tiotropium/Olodatérol", dosage: "2.5 mcg/2.5 mcg", unit: "inhalateur", adminRoute: "Inhalation", manufacturer: "Boehringer Ingelheim", description: "Bronchodilatateur pour la BPCO." },
    { tradeName: "Pneumovax", genericName: "Vaccin pneumococcique polyosidique", dosage: "0.5 ml", unit: "seringue préremplie", adminRoute: "Intramusculaire", manufacturer: "Merck Sharp & Dohme", description: "Vaccin contre les infections pneumococciques." },
    { tradeName: "Gardasil", genericName: "Vaccin contre le HPV", dosage: "0.5 ml", unit: "seringue préremplie", adminRoute: "Intramusculaire", manufacturer: "Merck", description: "Vaccin contre le papillomavirus humain (HPV)." },
    { tradeName: "Synflorix", genericName: "Vaccin pneumococcique conjugué", dosage: "0.5 ml", unit: "seringue préremplie", adminRoute: "Intramusculaire", manufacturer: "GlaxoSmithKline", description: "Vaccin pédiatrique contre le pneumocoque." },
    { tradeName: "Engerix B", genericName: "Vaccin contre l'hépatite B", dosage: "10 mcg/ml", unit: "flacon", adminRoute: "Intramusculaire", manufacturer: "GlaxoSmithKline", description: "Vaccin contre le virus de l'hépatite B." },
    { tradeName: "Tetanus Vaccine", genericName: "Vaccin antitétanique", dosage: "0.5 ml", unit: "flacon", adminRoute: "Intramusculaire", manufacturer: "Divers", description: "Immunisation contre le tétanos." },
    { tradeName: "Propanolol", genericName: "Propanolol", dosage: "40 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Bêta-bloquant non sélectif." },
    { tradeName: "Inderal", genericName: "Propanolol", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "AstraZeneca", description: "Traitement de l'hypertension, de l'angine, des migraines." },
    { tradeName: "Digoxin", genericName: "Digoxine", dosage: "0.25 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Glycoside cardiaque pour l'insuffisance cardiaque." },
    { tradeName: "Laxative", genericName: "Bisacodyl", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Laxatif stimulant pour la constipation." },
    { tradeName: "Metamucil", genericName: "Psyllium", dosage: "3.4 g", unit: "sachet", adminRoute: "Oral", manufacturer: "Procter & Gamble", description: "Laxatif de lest." },
    { tradeName: "Dulcolax", genericName: "Bisacodyl", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Soulagement de la constipation." },
    { tradeName: "Fer inject", genericName: "Carboxymaltose ferrique", dosage: "50 mg/ml", unit: "solution injectable", adminRoute: "Intraveineuse", manufacturer: "Vifor", description: "Traitement de l'anémie ferriprive." },
    { tradeName: "Ferro-grad", genericName: "Sulfate ferreux", dosage: "325 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Supplément de fer pour l'anémie." },
    { tradeName: "Folic Acid", genericName: "Acide folique", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Vitamine B9 pour la prévention des anomalies du tube neural." },
    { tradeName: "Vitamin B12", genericName: "Cyanocobalamine", dosage: "1000 mcg", unit: "ampoule", adminRoute: "Intramusculaire", manufacturer: "Divers", description: "Traitement de la carence en vitamine B12." },
    { tradeName: "Magnesium", genericName: "Chlorure de magnésium", dosage: "1 g", unit: "sachet", adminRoute: "Oral", manufacturer: "Divers", description: "Supplément de magnésium." },
    { tradeName: "Calcium", genericName: "Carbonate de calcium", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Supplément de calcium." },
    { tradeName: "Vitamin C", genericName: "Acide ascorbique", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Vitamine C pour le système immunitaire." },
    { tradeName: "Zinc", genericName: "Sulfate de zinc", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Supplément de zinc." },
    { tradeName: "Multivitamines", genericName: "Multivitamines", dosage: "1", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Supplément de vitamines et minéraux." },
    { tradeName: "Co-amoxiclav", genericName: "Amoxicilline/Acide clavulanique", dosage: "875 mg/125 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique." },
    { tradeName: "Levofloxacin", genericName: "Lévofloxacine", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique de la famille des fluoroquinolones." },
    { tradeName: "Doxycycline", genericName: "Doxycycline", dosage: "100 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique tétracycline." },
    { tradeName: "Metronidazole", genericName: "Métronidazole", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique et antiparasitaire." },
    { tradeName: "Nystatin", genericName: "Nystatine", dosage: "100000 UI/ml", unit: "suspension buvable", adminRoute: "Oral", manufacturer: "Divers", description: "Antifongique." },
    { tradeName: "Fluconazole", genericName: "Fluconazole", dosage: "150 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antifongique." },
    { tradeName: "Ketoconazole", genericName: "Kétoconazole", dosage: "200 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antifongique." },
    { tradeName: "Miconazole", genericName: "Miconazole", dosage: "2%", unit: "crème", adminRoute: "Topique", manufacturer: "Divers", description: "Antifongique topique." },
    { tradeName: "Clobetasol", genericName: "Clobétasol", dosage: "0.05%", unit: "crème", adminRoute: "Topique", manufacturer: "Divers", description: "Corticostéroïde topique puissant." },
    { tradeName: "Hydrocortisone", genericName: "Hydrocortisone", dosage: "1%", unit: "crème", adminRoute: "Topique", manufacturer: "Divers", description: "Corticostéroïde topique." },
    { tradeName: "Prednisolone", genericName: "Prednisolone", dosage: "20 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Corticostéroïde." },
    { tradeName: "Dexamethasone", genericName: "Dexaméthasone", dosage: "4 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Corticostéroïde." },
    { tradeName: "Insuline Glargine", genericName: "Insuline glargine", dosage: "100 UI/ml", unit: "stylo injectable", adminRoute: "Sous-cutanée", manufacturer: "Sanofi", description: "Insuline à action longue durée." },
    { tradeName: "Lantus", genericName: "Insuline glargine", dosage: "100 UI/ml", unit: "stylo injectable", adminRoute: "Sous-cutanée", manufacturer: "Sanofi", description: "Traitement du diabète." },
    { tradeName: "Humalog", genericName: "Insuline lispro", dosage: "100 UI/ml", unit: "flacon", adminRoute: "Sous-cutanée", manufacturer: "Eli Lilly", description: "Insuline à action ultra-rapide." },
    { tradeName: "Victoza", genericName: "Liraglutide", dosage: "6 mg/ml", unit: "stylo prérempli", adminRoute: "Sous-cutanée", manufacturer: "Novo Nordisk", description: "Antidiabétique injectable." },
    { tradeName: "Ozempic", genericName: "Sémaglutide", dosage: "0.25/0.5/1 mg", unit: "stylo prérempli", adminRoute: "Sous-cutanée", manufacturer: "Novo Nordisk", description: "Traitement du diabète de type 2 et de l'obésité." },
    { tradeName: "Aspirin Protect", genericName: "Acide acétylsalicylique", dosage: "100 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Bayer", description: "Antiagrégant plaquettaire." },
    { tradeName: "Heparin", genericName: "Héparine", dosage: "5000 UI/ml", unit: "flacon", adminRoute: "Injectable", manufacturer: "Divers", description: "Anticoagulant." },
    { tradeName: "Enoxaparin", genericName: "Énoxaparine sodique", dosage: "40 mg", unit: "seringue préremplie", adminRoute: "Sous-cutanée", manufacturer: "Divers", description: "Anticoagulant injectable." },
    { tradeName: "Lasix", genericName: "Furosémide", dosage: "20 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Diurétique puissant." },
    { tradeName: "Prozac", genericName: "Fluoxétine", dosage: "10 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Eli Lilly", description: "Antidépresseur." },
    { tradeName: "Zoloft", genericName: "Sertraline", dosage: "25 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Pfizer", description: "Antidépresseur." },
    { tradeName: "Risperdal", genericName: "Rispéridone", dosage: "1 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Janssen", description: "Antipsychotique." },
    { tradeName: "Depakine", genericName: "Valproate de sodium", dosage: "200 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Sanofi", description: "Anticonvulsivant." },
    { tradeName: "Tegretol", genericName: "Carbamazépine", dosage: "100 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Novartis", description: "Anticonvulsivant." },
    { tradeName: "Ventolin", genericName: "Salbutamol", dosage: "100 mcg", unit: "inhalateur", adminRoute: "Inhalation", manufacturer: "GlaxoSmithKline", description: "Bronchodilatateur." },
    { tradeName: "Singulair", genericName: "Montélukast", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Merck", description: "Antagoniste des leucotriènes." },
    { tradeName: "Hydrochlorothiazide", genericName: "Hydrochlorothiazide", dosage: "12.5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Diurétique thiazidique." },
    { tradeName: "Valsartan", genericName: "Valsartan", dosage: "80 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antagoniste des récepteurs de l'angiotensine II." },
    { tradeName: "Diovan", genericName: "Valsartan", dosage: "160 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Novartis", description: "Traitement de l'hypertension et de l'insuffisance cardiaque." },
    { tradeName: "Lisinopril", genericName: "Lisinopril", dosage: "5 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Inhibiteur de l'enzyme de conversion de l'angiotensine." },
    { tradeName: "Amlodipine", genericName: "Amlodipine", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antagoniste calcique." },
    { tradeName: "Ceftriaxone", genericName: "Ceftriaxone", dosage: "500 mg", unit: "flacon", adminRoute: "Intramusculaire/Intraveineuse", manufacturer: "Divers", description: "Antibiotique." },
    { tradeName: "Ciprofloxacine", genericName: "Ciprofloxacine", dosage: "500 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique de la famille des fluoroquinolones." },
    { tradeName: "Doxycycline", genericName: "Doxycycline", dosage: "50 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antibiotique tétracycline." },
    { tradeName: "Paroxetine", genericName: "Paroxétine", dosage: "20 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antidépresseur de type ISRS." },
    { tradeName: "Effexor", genericName: "Venlafaxine", dosage: "75 mg", unit: "gélule", adminRoute: "Oral", manufacturer: "Pfizer", description: "Antidépresseur de type ISRS et IRSN." },
    { tradeName: "Mirtazapine", genericName: "Mirtazapine", dosage: "15 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Divers", description: "Antidépresseur tétracyclique." },
    { tradeName: "Seroquel XR", genericName: "Quétiapine", dosage: "50 mg", unit: "comprimé à libération prolongée", adminRoute: "Oral", manufacturer: "AstraZeneca", description: "Antipsychotique." },
    { tradeName: "Abilify", genericName: "Aripiprazole", dosage: "10 mg", unit: "comprimé", adminRoute: "Oral", manufacturer: "Otsuka", description: "Antipsychotique atypique." }
  ];

  await prisma.medication.createMany({
    data: medicationsData,
  });

  const firstMedication = await prisma.medication.findFirst();

  if (firstMedication) {
    const prescription = await prisma.prescription.create({
      data: {
        date: new Date(),
        dosage: "2 comprimés par jour",
        duration: "5 jours",
        quantity: "10 comprimés",
        status: "Actif",
        consultationId: consultation.id,
        medications: { connect: { id: firstMedication.id } },
      },
    });
  }
  console.log("✅ Consultations, prescriptions et 100 médicaments créés.");

  console.log("🚨 Création des plaintes et des condamnations...");
  const plainte = await prisma.complaint.create({
    data: {
      plaintiffId: victime.id,
      accusedId: agresseur.id,
      date: new Date("2024-06-01T14:30:00Z"),
      description: "Vol de téléphone portable avec agression physique",
      place: "Quartier de la Victoire",
      type: "Vol à l'arraché",
      status: ComplaintStatus.PENDING,
      policeOfficerId: opjUser.id,
    },
  });
  
  const conviction = await prisma.conviction.create({
    data: {
      citizenId: agresseur.id,
      prosecutorId: procureurUser.id,
      date: new Date("2024-08-15"),
      jurisdiction: "Tribunal de Grande Instance",
      court: "TGI Kinshasa",
      offenseNature: "Vol qualifié",
      duration: "2 ans",
      startDate: new Date("2024-09-01"),
      status: "Condamné",
      sentence: "2 ans de prison ferme",
      sentenceType: SentenceType.IMPRISONMENT,
      paroleStatus: ParoleStatus.DENIED,
      rehabilitationStatus: RehabilitationStatus.PENDING,
      appealStatus: AppealStatus.PENDING,
    },
  });
  console.log("✅ Plaintes et condamnations créées.");


  console.log("📸 Création des données biométriques...");
  // --- WebAuthnCredential
  const webAuthnCredential = await prisma.webAuthnCredential.create({
    data: {
      citizenId: enfant1.id,
      credentialId: "example_credential_id_12345",
      publicKey: Buffer.from("example_public_key"),
      type: "fingerprint",
      name: "Index droit",
    },
  });

  // --- FaceDescriptor
  const faceDescriptor = await prisma.faceDescriptor.create({
    data: {
      citizenId: enfant1.id,
      descriptor: [0.123, 0.456, 0.789, 0.987, 0.654, 0.321, 0.555, 0.777],
      confidence: 0.95,
    },
  });
  console.log("✅ Données biométriques créées.");


  console.log("🎉 Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });