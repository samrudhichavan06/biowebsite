import {
  applyEmailCorsHeaders,
  escapeHtml,
  handleEmailOptionsRequest,
  parseJsonBody,
  sendEmail,
  sendJson,
} from "./_lib/email.js";

export default async function handler(req, res) {
  applyEmailCorsHeaders(res);

  if (handleEmailOptionsRequest(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let parsedBody;

  try {
    parsedBody = parseJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  const {
    attendeeEmail,
    attendeeName,
    eventName,
    passNumber,
    issuedAt,
    company,
    designation,
  } = parsedBody;

  if (
    !attendeeEmail ||
    !attendeeName ||
    !eventName ||
    !passNumber ||
    !issuedAt
  ) {
    return sendJson(res, 400, {
      error: "Missing required attendee email data",
    });
  }

  try {
    const safeName = escapeHtml(attendeeName);
    const safeEvent = escapeHtml(eventName);
    const safePass = escapeHtml(passNumber);
    const safeCompany = escapeHtml(company);
    const safeDesignation = escapeHtml(designation);
    const issuedLabel = new Date(issuedAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #10261a;">
        <h2 style="margin-bottom: 8px;">Registration Confirmed</h2>
        <p style="margin-top: 0; color: #3e5c4d;">Hello ${safeName}, your visitor registration has been received.</p>

        <div style="background: #f4fbf6; border: 1px solid #d2ead9; border-radius: 12px; padding: 16px; margin-top: 16px;">
          <p style="margin: 0 0 6px;"><strong>Event:</strong> ${safeEvent}</p>
          <p style="margin: 0 0 6px;"><strong>Pass Number:</strong> ${safePass}</p>
          <p style="margin: 0 0 6px;"><strong>Issued:</strong> ${issuedLabel}</p>
          <p style="margin: 0 0 6px;"><strong>Company:</strong> ${safeCompany || "-"}</p>
          <p style="margin: 0;"><strong>Designation:</strong> ${safeDesignation || "-"}</p>
        </div>

        <p style="margin-top: 18px;">Please keep your QR visitor pass ready for entry at the venue.</p>
        <p style="margin-top: 0; color: #3e5c4d;">Regards,<br />ACE Event Managers</p>
      </div>
    `;

    const result = await sendEmail({
      to: attendeeEmail,
      subject: `Your ${eventName} visitor pass is confirmed`,
      html: htmlBody,
      text: `Hello ${attendeeName}, your visitor registration for ${eventName} has been received. Pass Number: ${passNumber}.`,
    });

    return sendJson(res, 200, {
      ok: true,
      emailId: result.messageId || null,
      provider: result.provider,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "Failed to send attendee email",
      details:
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && "message" in error
            ? String(error.message)
            : "Unknown error",
    });
  }
}
