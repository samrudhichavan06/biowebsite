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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
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
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let body = {};
  try {
    body = await readJsonBody(req);
  } catch (err) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Invalid JSON" }));
    return;
  }

  const nowIso = new Date().toISOString();
  const record = {
    created_at: body.created_at || nowIso,
    event_name: body.event_name || "Bioenergy Global 2026",
    full_name: body.full_name || "",
    email: body.email || "",
    phone: body.phone || "",
    company: body.company || "",
    designation: body.designation || "",
    country: body.country || "",
    attendee_type: body.attendee_type || "Delegate",
    interests: body.interests || "",
    paymentId: body.paymentId || "",
  };

  if (!record.full_name || !record.email) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing required fields" }));
    return;
  }

  try {
    const admin = await initFirebaseAdminIfConfigured();
    if (!admin || !admin.firestore) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "FIREBASE_SERVICE_ACCOUNT_JSON not configured" }));
      return;
    }

    const db = admin.firestore();
    const docRef = await db.collection("registrations_bioenergy_global_2026").add(record);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, id: docRef.id }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(err) }));
  }
}
