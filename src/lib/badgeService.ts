/**
 * QR Badge System
 * Generates QR codes, creates badges, sends via email
 */

import QRCode from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { COLLECTIONS, Badge } from "./collections";

// ============ Badge Generation ============

export interface BadgeGenerationData {
  userId: string;
  userRole: "visitor" | "delegate" | "exhibitor";
  userEmail: string;
  userName: string;
  registrationCode?: string;
  additionalData?: Record<string, string>;
}

export async function generateQRCode(data: BadgeGenerationData): Promise<{
  qrCodeUrl: string;
  registrationCode: string;
}> {
  const registrationCode = data.registrationCode || generateRegistrationCode();
  
  // Create QR data with unique identifier
  const qrData = {
    id: data.userId,
    code: registrationCode,
    role: data.userRole,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const qrComponent = QRCode.toCanvas(
      canvas,
      JSON.stringify(qrData),
      {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        const qrCodeUrl = canvas.toDataURL("image/png");
        resolve({ qrCodeUrl, registrationCode });
      }
    );
  });
}

export function generateRegistrationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${timestamp}-${random}`;
}

// ============ Badge Creation & Storage ============

export async function createAndStoreBadge(
  data: BadgeGenerationData,
  qrCodeUrl: string,
  registrationCode: string
): Promise<Badge | null> {
  if (!db) return null;

  try {
    const badge: Badge = {
      id: uuidv4(),
      userId: data.userId,
      userRole: data.userRole,
      qrCodeData: JSON.stringify({
        id: data.userId,
        code: registrationCode,
        role: data.userRole,
      }),
      qrCodeUrl,
      registrationCode,
      emailSent: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.BADGES), badge);
    return { ...badge, id: docRef.id };
  } catch (error) {
    console.error("Error creating badge:", error);
    return null;
  }
}

// ============ Email Sending ============

export async function sendBadgeEmail(
  badgeId: string,
  userEmail: string,
  userName: string,
  qrCodeUrl: string,
  registrationCode: string,
  userRole: string
): Promise<boolean> {
  try {
    // Send email via backend API
    const response = await fetch("/api/send-badge-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        qrCodeUrl,
        registrationCode,
        role: userRole,
        badgeId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    // Update badge record with email sent status
    if (db) {
      await updateDoc(doc(db, COLLECTIONS.BADGES, badgeId), {
        emailSent: true,
        emailSentAt: Timestamp.now(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error sending badge email:", error);
    return false;
  }
}

// ============ Complete Badge Workflow ============

export async function generateAndSendBadge(
  data: BadgeGenerationData
): Promise<{ success: boolean; registrationCode?: string; error?: string }> {
  try {
    // Step 1: Generate QR code
    const { qrCodeUrl, registrationCode } = await generateQRCode(data);

    // Step 2: Store badge in Firestore
    const badge = await createAndStoreBadge(data, qrCodeUrl, registrationCode);
    if (!badge) {
      return { success: false, error: "Failed to create badge" };
    }

    // Step 3: Send email with badge
    const emailSent = await sendBadgeEmail(
      badge.id,
      data.userEmail,
      data.userName,
      qrCodeUrl,
      registrationCode,
      data.userRole
    );

    return {
      success: true,
      registrationCode: emailSent ? registrationCode : undefined,
    };
  } catch (error) {
    console.error("Error in badge workflow:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============ Badge Retrieval ============

export async function getBadgeByRegistrationCode(
  code: string
): Promise<Badge | null> {
  if (!db) return null;

  try {
    const q = query(
      collection(db, COLLECTIONS.BADGES),
      where("registrationCode", "==", code)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : (snapshot.docs[0].data() as Badge);
  } catch (error) {
    console.error("Error fetching badge:", error);
    return null;
  }
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, COLLECTIONS.BADGES),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Badge);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }
}

// ============ Badge Verification ============

export async function markBadgeAsScanned(badgeId: string, scannedBy: string): Promise<boolean> {
  if (!db) return false;

  try {
    await updateDoc(doc(db, COLLECTIONS.BADGES, badgeId), {
      scannedAt: Timestamp.now(),
      scannedBy,
    });
    return true;
  } catch (error) {
    console.error("Error marking badge as scanned:", error);
    return false;
  }
}
