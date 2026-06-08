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
  } catch (error) {
    console.error("Failed to load .env file:", error);
  }
}

async function initFirebaseAdminIfConfigured() {
  await ensureEnvFromDotenv();

  const svcJson =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!svcJson && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null;
  }

  try {
    const adminModule = await import("firebase-admin");
    const admin = adminModule.default || adminModule;

    const options = {};
    if (svcJson) {
      options.credential = admin.credential.cert(
        typeof svcJson === "string" ? JSON.parse(svcJson) : svcJson,
      );
    } else {
      options.credential = admin.credential.applicationDefault();
    }

    try {
      admin.initializeApp(options);
    } catch (err) {
      if (!/already exists/.test(String(err))) {
        throw err;
      }
    }

    return admin;
  } catch (error) {
    console.error("Failed to initialize firebase-admin:", error);
    return null;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    collection: "registrations_bioenergy_global_2026",
    force: false,
  };

  for (const arg of args) {
    if (arg === "--force" || arg === "-f") {
      result.force = true;
      continue;
    }
    if (arg.startsWith("--collection=")) {
      result.collection = arg.split("=", 2)[1] || result.collection;
      continue;
    }
    if (!arg.startsWith("-")) {
      result.collection = arg;
    }
  }

  return result;
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function deleteCollection(admin, collectionName) {
  const db = admin.firestore();
  const collectionRef = db.collection(collectionName);
  const docs = await collectionRef.listDocuments();

  if (docs.length === 0) {
    console.log(`Collection ${collectionName} is already empty.`);
    return;
  }

  console.log(
    `Found ${docs.length} documents in ${collectionName}. Deleting in batches...`,
  );
  const batches = chunkArray(docs, 500);

  for (const [index, batchDocs] of batches.entries()) {
    const batch = db.batch();
    batchDocs.forEach((docRef) => batch.delete(docRef));
    await batch.commit();
    console.log(
      `Deleted batch ${index + 1}/${batches.length} (${batchDocs.length} docs)`,
    );
  }

  console.log(`Deletion complete for collection ${collectionName}.`);
}

async function main() {
  const { collection, force } = parseArgs();
  if (!force) {
    console.error(
      "This script is destructive. Add --force to confirm deletion.",
    );
    process.exit(1);
  }

  const admin = await initFirebaseAdminIfConfigured();
  if (!admin) {
    console.error(
      "Firebase admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.",
    );
    process.exit(1);
  }

  console.log(`Deleting all documents from collection: ${collection}`);
  await deleteCollection(admin, collection);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
