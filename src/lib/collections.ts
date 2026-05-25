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
  EXHIBITOR_PAYMENT_HISTORY: "exhibitor_payment_history",
  BADGES: "badges",
  NOTIFICATIONS: "notifications",
  ADMIN_SETTINGS: "admin_settings",
  EXHIBITOR_MESSAGES: "exhibitor_messages",
  EXHIBITOR_FEEDBACK: "exhibitor_feedback",
  DOCUMENT_APPROVALS: "document_approvals",
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
  paymentProofUrl?: string;
  paymentTransactionId?: string;
  logoUrl?: string;
  brochureUrl?: string;
  exhibitorManualDownloaded: boolean;
  additionalNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ Exhibitor Payment History Schema ============
export interface ExhibitorPaymentHistory {
  id: string;
  exhibitorId: string;
  boothName: string;
  companyName: string;
  paymentAmount: number;
  paymentStatus: "pending" | "partial" | "completed";
  transactionId: string;
  proofUrl?: string;
  recordedAt: string;
  source?: "exhibitor" | "admin";
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

// ============ Exhibitor Message Schema ============
export interface ExhibitorMessage {
  id: string;
  exhibitorId: string;
  senderId: string; // admin user id or exhibitor id
  senderRole: "admin" | "exhibitor";
  senderName: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  read: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

// ============ Exhibitor Feedback Schema ============
export interface ExhibitorFeedback {
  id: string;
  exhibitorId: string;
  adminId: string;
  feedbackType: "logo" | "brochure" | "booth_design" | "materials" | "general";
  title: string;
  comment: string;
  status: "pending" | "resolved" | "acknowledged";
  priority: "low" | "medium" | "high";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ Document Approval Schema ============
export interface DocumentApproval {
  id: string;
  exhibitorId: string;
  documentType: "logo" | "brochure" | "booth_design" | "certificate_of_participation";
  documentUrl: string;
  documentName: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
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

export async function getExhibitorPaymentHistory(exhibitorId: string): Promise<ExhibitorPaymentHistory[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.EXHIBITOR_PAYMENT_HISTORY),
    where("exhibitorId", "==", exhibitorId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as ExhibitorPaymentHistory) }))
    .sort((a, b) => String(b.recordedAt || "").localeCompare(String(a.recordedAt || "")));
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

// ============ Exhibitor Message Functions ============
export async function getExhibitorMessages(exhibitorId: string): Promise<ExhibitorMessage[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.EXHIBITOR_MESSAGES),
    where("exhibitorId", "==", exhibitorId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() as ExhibitorMessage }))
    .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());
}

export async function getExhibitorFeedback(exhibitorId: string): Promise<ExhibitorFeedback[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.EXHIBITOR_FEEDBACK),
    where("exhibitorId", "==", exhibitorId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() as ExhibitorFeedback }))
    .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());
}

export async function getDocumentApprovalsForExhibitor(exhibitorId: string): Promise<DocumentApproval[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTIONS.DOCUMENT_APPROVALS),
    where("exhibitorId", "==", exhibitorId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() as DocumentApproval }))
    .sort((a, b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());
}

export async function getAllExhibitorFeedback(): Promise<(ExhibitorFeedback & { exhibitorId: string })[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, COLLECTIONS.EXHIBITOR_FEEDBACK));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as ExhibitorFeedback & { exhibitorId: string } }));
}
