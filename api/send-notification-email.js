import {
  applyEmailCorsHeaders,
  escapeHtml,
  handleEmailOptionsRequest,
  parseJsonBody,
  sendEmail,
  sendJson,
} from "./_lib/email.js";

function getNotificationTemplate(title, message, type) {
  const typeColors = {
    success: { bg: "#10b981", border: "#059669" },
    error: { bg: "#ef4444", border: "#dc2626" },
    warning: { bg: "#f59e0b", border: "#d97706" },
    info: { bg: "#3b82f6", border: "#2563eb" },
  };

  const typeEmojis = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "ℹ",
  };

  const colors = typeColors[type] || typeColors.info;
  const emoji = typeEmojis[type] || typeEmojis.info;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .notification-box { background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; border-left: 5px solid ${colors.bg}; }
          .status-icon { display: inline-block; width: 50px; height: 50px; background: ${colors.bg}; color: white; border-radius: 50%; text-align: center; line-height: 50px; font-size: 28px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #333; margin: 15px 0; }
          .message { font-size: 16px; color: #555; line-height: 1.8; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .button { display: inline-block; background: ${colors.bg}; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bioenergy Expo 2026</h1>
            <p>Notification</p>
          </div>
          <div class="notification-box">
            <div class="status-icon">${emoji}</div>
            <div class="title">${escapeHtml(title)}</div>
            <div class="message">${escapeHtml(message).replace(/\n/g, "<br>")}</div>
            <div class="footer">
              <p>This is an automated notification from Bioenergy Expo 2026</p>
              <p>© 2026 Bioenergy Expo. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

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

  const { email, title, message, type } = parsedBody;

  // Validation
  if (!email || !title || !message) {
    return sendJson(res, 400, {
      error: "Missing required fields: email, title, message",
    });
  }

  try {
    const htmlContent = getNotificationTemplate(title, message, type || "info");

    const result = await sendEmail({
      to: email,
      subject: `[Bioenergy Expo 2026] ${title}`,
      html: htmlContent,
      text: `${title}\n\n${message}`,
    });

    return sendJson(res, 200, {
      success: true,
      message: "Notification email sent successfully",
      email,
      emailId: result.messageId || null,
      provider: result.provider,
    });
  } catch (error) {
    console.error("Error sending notification email:", error);
    return sendJson(res, 500, {
      error: "Failed to send notification email",
      details:
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && "message" in error
            ? String(error.message)
            : "Unknown error",
    });
  }
}
