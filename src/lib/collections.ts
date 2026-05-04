/**
 * Firestore Collections & Types
 * Schemas for: exhibitors, visitors, delegates, fabricators, admin
 */

import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ============ Collection Names ============
export const COLLECTIONS = {
  EXHIBITORS: "exhibitors",
  VISITORS: "visitors",
  DELEGATES: "delegates",
  FABRICATORS: "fabricators",
  DOWNLOADS: "downloads",
  BADGES: "badges",
  NOTIFICATIONS: "notifications",
  ADMIN_SETTINGS: "admin_settings",
} as const;

// ============ Exhibitor Schema ============
export interface Exhibitor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  stallSize: "small" | "medium" | "large"; // 10x10, 20x20, 30x30
  boothNumber?: string;
  stallAllocated?: boolean;
  paymentStatus: "pending" | "partial" | "completed";
  paymentAmount: number;
  logoUrl?: string;
  brochureUrl?: string;
  exhibitorManualDownloaded: boolean;
  additionalNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ Visitor Schema ============
export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  registrationCode: string;
  qrCode: string; // QR code data URL
  badge: {
    generated: boolean;
    downloadedAt?: Timestamp;
  };
  eventId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ Delegate Schema ============
export interface Delegate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  passType: "standard" | "vip" | "speaker";
  speakerDetails?: {
    topic: string;
    bio: string;
    sessionTime: string;
  };
  agendaDownloaded: boolean;
  certificateGenerated: boolean;
  eventId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ Fabricator Schema ============
export interface Fabricator {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  specialization: string[]; // e.g., ["Welding", "Fabrication", "Assembly"]
  designSubmissionStatus: "pending" | "submitted" | "approved" | "rejected";
  drawingsUrl?: string;
  approvalNotes?: string;
  guidelinesAccepted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ QR Badge Schema ============
export interface Badge {
  id: string;
  userId: string;
  userRole: "visitor" | "delegate" | "exhibitor";
  qrCodeData: string;
  qrCodeUrl: string;
  registrationCode: string;
  emailSent: boolean;
  emailSentAt?: Timestamp;
  scannedAt?: Timestamp;
  scannedBy?: string;
  createdAt: Timestamp;
}

// ============ Download Schema ============
export interface Download {
  id: string;
  title: string;
  type: "brochure" | "floor_plan" | "manual" | "agenda" | "guidelines";
  fileUrl: string;
  fileSize: number; // in MB
  category: string; // e.g., "Exhibitor", "Visitor", "Fabricator"
  eventId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ Notification Schema ============
export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  readAt?: Timestamp;
  actionUrl?: string;
  createdAt: Timestamp;
}

// ============ Helper Functions ============

export async function getExhibitorByEmail(email: string): Promise<Exhibitor | null> {
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.EXHIBITORS),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as Exhibitor);
}

export async function getVisitorByEmail(email: string): Promise<Visitor | null> {
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.VISITORS),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as Visitor);
}

export async function getDelegateByEmail(email: string): Promise<Delegate | null> {
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.DELEGATES),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as Delegate);
}

export async function getFabricatorByEmail(email: string): Promise<Fabricator | null> {
  if (!db) return null;
  const q = query(
    collection(db, COLLECTIONS.FABRICATORS),
    where("email", "==", email)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as Fabricator);
}

export async function getAllNotifications(userId: string): Promise<Notification[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where("recipientId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Notification);
}

export async function getDownloadsByCategory(category: string): Promise<Download[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.DOWNLOADS),
    where("category", "==", category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Download);
}
