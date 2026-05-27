import crypto from "crypto";
import fs from "fs";
import path from "path";

let adminInitialized = false;
let cachedAdmin = null;

async function initFirebaseAdminIfConfigured() {
  if (adminInitialized) return cachedAdmin;

  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!svcJson) {
    adminInitialized = true;
    return null;
  }

  try {
    const serviceAccount = typeof svcJson === "string" ? JSON.parse(svcJson) : svcJson;
    const adminModule = await import("firebase-admin");
    const admin = adminModule.default || adminModule;
    // Initialize only once
    try {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) {
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

export default async function handler(req, res) {
  // Razorpay sends raw POST body; collect raw body for HMAC verification
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const secret = process.env.RZP_WEBHOOK_SECRET || "";

  if (!secret) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Webhook secret not configured on server" }));
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);

    const signature = req.headers["x-razorpay-signature"] || req.headers["X-Razorpay-Signature"] || "";

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    if (!signature || signature !== expected) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "Invalid signature" }));
      return;
    }

    const payload = JSON.parse(rawBody.toString("utf8") || "{}");

    // Extract payment entity if present
    const payment = payload?.payload?.payment?.entity || null;

    const record = {
      razorpay_event: payload?.event || null,
      received_at: new Date().toISOString(),
      payment: payment || payload,
    };

    // Attempt to persist to Firestore via admin SDK if service account is provided
    try {
      const adminModule = await initFirebaseAdminIfConfigured();

      if (adminModule && adminModule.firestore) {
        const db = adminModule.firestore();
        const docId = payment?.id || `order_${payload?.payload?.payment?.entity?.order_id || Date.now()}`;
        await db.collection("payments").doc(String(docId)).set(record, { merge: true });
      } else {
        // Fallback: append to a local file for debugging
        const dataDir = path.resolve(process.cwd(), "data");
        try {
          if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
          const filePath = path.join(dataDir, "webhook_payments.jsonl");
          fs.appendFileSync(filePath, JSON.stringify(record) + "\n");
        } catch (e) {
          console.error("Failed to write webhook fallback file:", e);
        }
      }
    } catch (e) {
      console.error("Error persisting webhook:", e);
    }

    // Acknowledge the webhook
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(err) }));
  }
}
