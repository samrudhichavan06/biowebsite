import { sendJson, parseJsonBody, applyEmailCorsHeaders } from "../_lib/email.js";

export default async function handler(req, res) {
  applyEmailCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const body = parseJsonBody(req);
  const amount = Number(body.amount) || 0;
  const currency = body.currency || "INR";
  const receipt = body.receipt || `rcpt_${Date.now()}`;
  const notes = body.notes || {};

  if (!amount || amount <= 0) {
    return sendJson(res, 400, { error: "Invalid amount" });
  }

  // Ensure server env keys are available. In dev, process.env may not include values
  // so attempt to read from local .env as a fallback.
  const ensureEnvFromDotenv = async () => {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const envPath = path.resolve(process.cwd(), ".env");
      if (!fs.existsSync(envPath)) return;
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const idx = trimmed.indexOf("=");
        if (idx === -1) continue;
        const k = trimmed.slice(0, idx).trim();
        let v = trimmed.slice(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!process.env[k]) process.env[k] = v;
      }
    } catch (e) {
      // ignore
    }
  };

  await ensureEnvFromDotenv();

  const keyId = process.env.RZP_KEY_ID || "";
  const keySecret = process.env.RZP_KEY_SECRET || "";

  if (!keyId || !keySecret) {
    return sendJson(res, 500, { error: "Razorpay keys are not configured on the server" });
  }

  try {
    const payload = {
      amount: Math.round(Number(amount)),
      currency,
      receipt,
      notes,
    };

    const basic = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return sendJson(res, response.status || 500, { error: data });
    }

    return sendJson(res, 200, { ok: true, order: data });
  } catch (err) {
    return sendJson(res, 500, { error: String(err) });
  }
}
