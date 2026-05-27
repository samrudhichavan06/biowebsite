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

    try {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) {
      // ignore re-initialization errors
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
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
    return;
  }

  try {
    const body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
        } catch (error) {
          reject(error);
        }
      });
      req.on("error", reject);
    });

    const adminModule = await initFirebaseAdminIfConfigured();
    if (!adminModule || !adminModule.firestore) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "Firebase admin not configured on server" }));
      return;
    }

    const db = adminModule.firestore();
    const delegateId = String(body.paymentId || body.email || Date.now());
    const now = new Date().toISOString();

    const delegateRecord = {
      createdAt: now,
      updatedAt: now,
      eventId: "bioenergy-global-2026",
      firstName: String(body.fullName || "").trim().split(/\s+/)[0] || "",
      lastName: String(body.fullName || "").trim().split(/\s+/).slice(1).join(" ") || "",
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      company: String(body.company || "").trim(),
      designation: String(body.designation || "").trim(),
      passType: "vip",
      agendaDownloaded: false,
      certificateGenerated: false,
      paymentId: String(body.paymentId || "").trim(),
      passNumber: String(body.passNumber || "").trim(),
      attendeeType: "Delegate",
    };

    const registrationRecord = {
      created_at: now,
      event_name: "Bioenergy Global 2026",
      full_name: String(body.fullName || "").trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      company: String(body.company || "").trim(),
      designation: String(body.designation || "").trim(),
      country: String(body.country || "").trim(),
      attendee_type: "Delegate",
      interests: String(body.interests || "").trim(),
      paymentId: String(body.paymentId || "").trim(),
      passNumber: String(body.passNumber || "").trim(),
    };

    await Promise.all([
      db.collection("delegates").doc(delegateId).set(delegateRecord, { merge: true }),
      db.collection("registrations_bioenergy_global_2026").doc(delegateId).set(registrationRecord, { merge: true }),
    ]);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    console.error("record-delegate error:", error);

    try {
      const dataDir = path.resolve(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.appendFileSync(path.join(dataDir, "delegate_records.jsonl"), JSON.stringify({ error: String(error), at: new Date().toISOString() }) + "\n");
    } catch (fileErr) {
      console.error("Failed to write delegate fallback file:", fileErr);
    }

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: String(error) }));
  }
}