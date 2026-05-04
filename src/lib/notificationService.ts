/**
 * Notification System
 * Handles in-app notifications, email notifications, and push notifications
 */

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
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { COLLECTIONS, Notification } from "./collections";

export type NotificationType = "info" | "warning" | "success" | "error";

export interface NotificationPayload {
  recipientId: string;
  recipientRole: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  sendEmail?: boolean;
  emailAddress?: string;
}

// ============ Send Notification ============

export async function sendNotification(payload: NotificationPayload): Promise<Notification | null> {
  if (!db) return null;

  try {
    const notification: Notification = {
      id: "",
      recipientId: payload.recipientId,
      recipientRole: payload.recipientRole,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      read: false,
      actionUrl: payload.actionUrl,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notification);

    // Send email if requested
    if (payload.sendEmail && payload.emailAddress) {
      await sendNotificationEmail(
        payload.emailAddress,
        payload.title,
        payload.message,
        payload.type
      );
    }

    return { ...notification, id: docRef.id };
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
}

// ============ Bulk Notifications ============

export async function sendBulkNotifications(
  recipientIds: string[],
  roleFilter?: string,
  payload: Omit<NotificationPayload, "recipientId" | "recipientRole">,
): Promise<number> {
  if (!db) return 0;

  let sendCount = 0;

  try {
    for (const recipientId of recipientIds) {
      const notif = await sendNotification({
        recipientId,
        recipientRole: roleFilter || "user",
        ...payload,
      });

      if (notif) sendCount++;
    }

    return sendCount;
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    return sendCount;
  }
}

// ============ Notification Retrieval ============

export async function getUserNotifications(
  userId: string,
  unreadOnly = false
): Promise<Notification[]> {
  if (!db) return [];

  try {
    let q;
    if (unreadOnly) {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("recipientId", "==", userId),
        where("read", "==", false),
        orderBy("createdAt", "desc"),
        firestoreLimit(50)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("recipientId", "==", userId),
        orderBy("createdAt", "desc"),
        firestoreLimit(50)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getNotificationsByRole(
  role: string,
  unreadOnly = false
): Promise<Notification[]> {
  if (!db) return [];

  try {
    let q;
    if (unreadOnly) {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("recipientRole", "==", role),
        where("read", "==", false),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("recipientRole", "==", role),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

// ============ Mark as Read ============

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  if (!db) return false;

  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
      read: true,
      readAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  if (!db) return false;

  try {
    const notifications = await getUserNotifications(userId, true);

    for (const notif of notifications) {
      await markNotificationAsRead(notif.id);
    }

    return true;
  } catch (error) {
    console.error("Error marking all as read:", error);
    return false;
  }
}

// ============ Pre-defined Notification Templates ============

export async function notifyRegistrationSuccess(
  userId: string,
  role: string,
  userEmail: string,
  userName: string
): Promise<Notification | null> {
  const titles: Record<string, string> = {
    exhibitor: "Exhibitor Registration Successful",
    visitor: "Registration Complete",
    delegate: "Delegate Registration Successful",
    fabricator: "Vendor Registration Successful",
  };

  const messages: Record<string, string> = {
    exhibitor: `Welcome ${userName}! Your exhibitor account has been created. Check your email for badge and payment details.`,
    visitor: `Welcome ${userName}! Your registration is complete. Your badge has been sent to your email.`,
    delegate: `Welcome ${userName}! Your conference registration is confirmed. Check your email for your badge and agenda.`,
    fabricator: `Welcome ${userName}! Your vendor account is ready. Access the portal to submit designs.`,
  };

  return sendNotification({
    recipientId: userId,
    recipientRole: role,
    title: titles[role] || "Registration Successful",
    message: messages[role] || "Your registration is complete!",
    type: "success",
    sendEmail: true,
    emailAddress: userEmail,
  });
}

export async function notifyPaymentReceived(
  userId: string,
  amount: number,
  stallSize: string
): Promise<Notification | null> {
  return sendNotification({
    recipientId: userId,
    recipientRole: "exhibitor",
    title: "Payment Received",
    message: `Payment of ₹${amount} for ${stallSize} stall has been received. Your booking is confirmed.`,
    type: "success",
  });
}

export async function notifyEventReminder(
  userId: string,
  role: string,
  eventName: string,
  daysAway: number
): Promise<Notification | null> {
  return sendNotification({
    recipientId: userId,
    recipientRole: role,
    title: `${eventName} Starting Soon`,
    message: `${eventName} starts in ${daysAway} day${daysAway !== 1 ? "s" : ""}. Make sure you have all required documents ready.`,
    type: "info",
  });
}

export async function notifyDesignApproval(
  userId: string,
  designName: string,
  approved: boolean,
  comments?: string
): Promise<Notification | null> {
  return sendNotification({
    recipientId: userId,
    recipientRole: "fabricator",
    title: approved ? "Design Approved" : "Design Requires Revision",
    message: approved
      ? `Your design "${designName}" has been approved!`
      : `Your design "${designName}" requires revision. Comments: ${comments}`,
    type: approved ? "success" : "warning",
  });
}

// ============ Email Notification ============

async function sendNotificationEmail(
  email: string,
  title: string,
  message: string,
  type: NotificationType
): Promise<boolean> {
  try {
    const response = await fetch("/api/send-notification-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        title,
        message,
        type,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error sending notification email:", error);
    return false;
  }
}

// ============ Cleanup Old Notifications ============

export async function cleanupOldNotifications(daysOld: number = 90): Promise<number> {
  if (!db) return 0;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("createdAt", "<", Timestamp.fromDate(cutoffDate))
    );

    const snapshot = await getDocs(q);
    let deletedCount = 0;

    for (const docSnap of snapshot.docs) {
      // Note: Firestore doesn't have batch delete in client SDK, so we'd need a Cloud Function
      // For now, just count
      deletedCount++;
    }

    console.log(`Cleanup: Would delete ${deletedCount} old notifications`);
    return deletedCount;
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
    return 0;
  }
}
