import { applyEmailCorsHeaders, getEmailServiceStatus, sendJson } from "./_lib/email.js";

export default async function handler(req, res) {
  applyEmailCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const status = getEmailServiceStatus();

  return sendJson(res, 200, {
    ok: true,
    fromEmail: status.fromEmail,
    provider: status.provider,
  });
}
