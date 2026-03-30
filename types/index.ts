export type ExperienceLevel = 'nybegynner' | 'erfaren' | 'profesjonell';
export type HiveType = 'langstroth' | 'warre' | 'toppstang' | 'annet';
export type SubscriptionTier = 'starter' | 'hobbyist' | 'profesjonell' | 'lag';
export type TeamRole = 'owner' | 'admin' | 'member';
export type DiseaseSeverity = 'lav' | 'moderat' | 'alvorlig' | 'kritisk';
export type MediaType = 'image' | 'video';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  municipalityId: number | null;
  experienceLevel: ExperienceLevel | null;
  subscriptionTier: SubscriptionTier;
  teamId: string | null;
  createdAt: string;
}

export interface Municipality {
  id: number;
  name: string;
  county: string;
  lat: number;
  lng: number;
}

export interface Hive {
  id: string;
  userId: string;
  name: string;
  type: HiveType;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
}

export interface Inspection {
  id: string;
  hiveId: string;
  userId: string;
  inspectedAt: string;
  weatherTemp: number | null;
  weatherCondition: string | null;
  numFramesBrood: number | null;
  numFramesHoney: number | null;
  numFramesEmpty: number | null;
  queenSeen: boolean;
  queenCellsFound: boolean;
  varroaCount: number | null;
  varroaMethod: string | null;
  diseaseObservations: Record<string, unknown> | null;
  treatmentApplied: boolean;
  treatmentProduct: string | null;
  notes: string | null;
  moodScore: number | null;
}

export interface InspectionMedia {
  id: string;
  inspectionId: string;
  storagePath: string;
  mediaType: MediaType;
  createdAt: string;
}

export interface DiseasePhoto {
  uri?: string;    // Ekte foto-URL (vises som Image)
  emoji?: string;  // Fallback når ingen uri
  caption: string;
  bg: string;
}

export interface Disease {
  id: string;
  slug: string;
  nameNo: string;
  isNotifiable: boolean;
  severity: DiseaseSeverity;
  description: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  thumbnailPath: string | null;
  photos: DiseasePhoto[];
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  maxMembers: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  eventDate: string; // 'YYYY-MM-DD'
  notes: string | null;
  notificationId: string | null;
  createdAt: string;
}

export interface HarvestRecord {
  id: string;
  userId: string;
  hiveId: string;
  harvestedAt: string; // 'YYYY-MM-DD'
  quantityKg: number;
  notes: string | null;
  createdAt: string;
}
