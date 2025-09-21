export type Role = "ADMIN" | "MEDECIN" | "PROCUREUR" | "OPJ" | "OFFICIER_ETAT_CIVIL" | "CITOYEN"

export type Gender = "MALE" | "FEMALE" | "OTHER"
export type Nationality = "NATIONAL" | "FOREIGN"
export type EthnicGroup = "GROUP_A" | "GROUP_B" // Adapter selon pays
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED"
export type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
export type SentenceType = "IMPRISONMENT" | "FINE" | "COMMUNITY_SERVICE"
export type ParoleStatus = "ELIGIBLE" | "GRANTED" | "DENIED"
export type RehabilitationStatus = "PENDING" | "COMPLETED"
export type AppealStatus = "NONE" | "PENDING" | "ACCEPTED" | "REJECTED"
export type MarriageType = "CIVIL" | "RELIGIOUS" | "TRADITIONAL"
export type ContractType = "COMMUNITY_PROPERTY" | "SEPARATION_OF_PROPERTY"

// Interfaces principales
export interface User {
  id: number
  email: string
  username: string
  roles: Role[]
  avatar?: string
  accountNonExpired: boolean
  accountNonLocked: boolean
  credentialsNonExpired: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
  isUsing2FA: boolean
}

export interface Citizen extends User {
  lastName: string
  firstName: string
  maidenName?: string
  birthDate: string
  birthPlace: string
  nationalityID: string
  nationality: Nationality
  gender: Gender
  ethnicGroup?: EthnicGroup
  community?: string
  territory?: string
  father?: Citizen
  mother?: Citizen
  currentAddress: string
  phoneNumber?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  bloodType?: BloodType
  disabilities?: string
  educationLevel?: string
  profession?: string
  maritalStatus: MaritalStatus
  occupation?: string
  religion?: string
  voterStatus?: string
  taxIdentificationNumber?: string
  socialSecurityNumber?: string
  drivingLicenseNumber?: string
  passportNumber?: string
  images?: Image[]
  birthRecord?: BirthRecord
  marriagesAsPartner1?: MarriageRecord[]
  marriagesAsPartner2?: MarriageRecord[]
  deathRecord?: DeathRecord
  consultations?: Consultation[]
  convictions?: Conviction[]
  filedComplaints?: Complaint[]
  receivedComplaints?: Complaint[]
}

export interface Image {
  id: number
  path: string
  citizenId?: number
}

export interface BirthRecord {
  id: number
  registrationNumber: string
  citizenId: number
  officiantId: number
  declarerId: number
  date: string
  place: string
  childName: string
  gender: Gender
  birthDate: string
  birthPlace: string
  weight: number
  height: number
  birthTime: string
}

export interface MarriageRecord {
  id: number
  partner1Id: number
  partner2Id: number
  marriagePlace: string
  marriageDate: string
  officiantId: number
  witness1Id: number
  witness2Id: number
  witness3Id?: number
  marriageType: MarriageType
  contractType?: ContractType
}

export interface DeathRecord {
  id: number
  citizenId: number
  deathPlace: string
  deathDate: string
  declarerId: number
  officiantId: number
  informantRelationship: string
  funeralPlace?: string
  cemeteryName?: string
}

export interface Consultation {
  id: number
  date: string
  diagnosis: string
  price: number
  duration: string
  notes?: string
  doctorId: number
  patientId: number
  prescriptions?: Prescription[]
}

export interface Prescription {
  id: number
  date: string
  dosage: string
  duration: string
  quantity: string
  status: string
  consultationId?: number
  medications?: Medication[]
}

export interface Medication {
  id: number
  tradeName: string
  genericName: string
  dosage: string
  unit: string
  adminRoute: string
  manufacturer: string
  description?: string
}

export interface Complaint {
  id: number
  plaintiffId: number
  accusedId?: number
  date: string
  description: string
  place: string
  type: string
  status: ComplaintStatus
  witnesses?: string
  evidence?: string
  policeOfficerId: number
}

export interface Conviction {
  id: number
  date: string
  jurisdiction: string
  court: string
  offenseNature: string
  duration?: string
  fineAmount?: number
  startDate?: string
  endDate?: string
  status: string
  sentence: string
  sentenceType: SentenceType
  paroleStatus?: ParoleStatus
  rehabilitationStatus?: RehabilitationStatus
  appealStatus?: AppealStatus
  citizenId: number
  prosecutorId: number
}
