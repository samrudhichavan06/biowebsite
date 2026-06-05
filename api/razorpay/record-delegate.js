import crypto from "crypto";
import fs from "fs";
import path from "path";

async function ensureEnvFromDotenv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore local dotenv fallback failures
  }
}

let adminInitialized = false;
let cachedAdmin = null;

async function initFirebaseAdminIfConfigured() {
  if (adminInitialized) return cachedAdmin;

  const svcJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svcJson) {
    adminInitialized = true;
    return null;
  }

  try {
    const serviceAccount =
      typeof svcJson === "string" ? JSON.parse(svcJson) : svcJson;
    const adminModule = await import("firebase-admin");
    const admin = adminModule.default || adminModule;
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch {
      // ignore if already initialized
    }

    adminInitialized = true;
    cachedAdmin = admin;
    return admin;
  } catch (err) {
    adminInitialized = true;
    console.error("Failed to initialize firebase-admin:", err);
    return null;
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(text));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function splitName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "Delegate", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  await ensureEnvFromDotenv();

  try {
    const body = await parseJsonBody(req);
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const company = String(body.company || "").trim();
    const designation = String(body.designation || "").trim();
    const paymentId = String(body.paymentId || "").trim();
    const orderId = String(body.orderId || "").trim();
    const attendeeType =
      String(body.attendeeType || "Delegate").trim() || "Delegate";
    const eventId = String(body.eventId || "bioenergy-global-2026").trim();
    const eventName = String(body.eventName || "Bioenergy Global 2026").trim();
    const packageId = String(body.packageId || "").trim();
    const packageTitle = String(body.packageTitle || "").trim();
    const amount = Number(body.amount || body.amount_inr || 0);
    const receipt = String(
      body.receipt || paymentId || orderId || `rcpt_${Date.now()}`,
    ).trim();
    const registrationCode = String(
      body.registrationCode || `RCPT-${Date.now()}`,
    ).trim();

    if (!fullName || !email) {
      return sendJson(res, 400, {
        ok: false,
        error: "Missing delegate details",
      });
    }

    const { firstName, lastName } = splitName(fullName);
    const receivedAt = new Date().toISOString();
    const recordBase = {
      fullName,
      email,
      phone,
      company,
      designation,
      attendeeType,
      paymentId,
      orderId,
      eventId,
      eventName,
      packageId,
      packageTitle,
      receipt,
      registrationCode,
      createdAt: receivedAt,
      updatedAt: receivedAt,
    };

    const adminModule = await initFirebaseAdminIfConfigured();

    if (adminModule && adminModule.firestore) {
      const db = adminModule.firestore();
      const delegateDocId = paymentId || orderId || receipt || `${Date.now()}`;

      await db
        .collection("delegates")
        .doc(String(delegateDocId))
        .set(
          {
            id: String(delegateDocId),
            firstName,
            lastName,
            email,
            phone,
            company,
            designation,
            passType: "vip",
            agendaDownloaded: false,
            certificateGenerated: false,
            eventId,
            packageId,
            packageTitle,
            amount,
            createdAt: adminModule.firestore.FieldValue.serverTimestamp(),
            updatedAt: adminModule.firestore.FieldValue.serverTimestamp(),
            paymentId,
            orderId,
            attendeeType,
            fullName,
          },
          { merge: true },
        );

      await db
        .collection("registrations_bioenergy_global_2026")
        .doc(String(delegateDocId))
        .set(
          {
            id: String(delegateDocId),
            ...recordBase,
            amount,
            created_at: receivedAt,
            event_name: eventName,
            full_name: fullName,
            attendee_type: attendeeType,
            country: String(body.country || "").trim(),
            interests: String(body.interests || "").trim(),
            payment_status: "completed",
          },
          { merge: true },
        );

      return sendJson(res, 200, { ok: true, stored: true, delegateDocId });
    }

    const dataDir = path.resolve(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const filePath = path.join(dataDir, "delegates.jsonl");
    fs.appendFileSync(
      filePath,
      JSON.stringify({
        ...recordBase,
        created_at: receivedAt,
        full_name: fullName,
        event_name: eventName,
        attendee_type: attendeeType,
      }) + "\n",
    );

    return sendJson(res, 200, { ok: true, stored: false, fallback: true });
  } catch (error) {
    console.error("Failed to record delegate:", error);
    return sendJson(res, 500, { ok: false, error: String(error) });
  }
}
