import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const fromEmail = process.env.AWS_SES_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;

const sesClient = awsRegion && awsAccessKeyId && awsSecretAccessKey
  ? new SESv2Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    })
  : null;

const sendJson = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

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
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const parsedBody =
    typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  const { email, title, message, type } = parsedBody;

  // Validation
  if (!email || !title || !message) {
    return sendJson(res, 400, {
      error: "Missing required fields: email, title, message",
    });
  }

  // Check if email service is configured
  if (!sesClient || !fromEmail) {
    console.warn("Email service not configured. Notification would have been sent to:", email);
    return sendJson(res, 200, {
      success: true,
      message: "Notification queued (service not configured in this environment)",
    });
  }

  try {
    const htmlContent = getNotificationTemplate(title, message, type || "info");

    const command = new SendEmailCommand({
      FromEmailAddress: fromEmail,
      Destination: {
        ToAddresses: [email],
      },
      Content: {
        Simple: {
          Subject: {
            Data: `[Bioenergy Expo 2026] ${title}`,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: htmlContent,
              Charset: "UTF-8",
            },
          },
        },
      },
    });

    await sesClient.send(command);

    return sendJson(res, 200, {
      success: true,
      message: "Notification email sent successfully",
      email,
    });
  } catch (error) {
    console.error("Error sending notification email:", error);
    return sendJson(res, 500, {
      error: "Failed to send notification email",
      details: error.message,
    });
  }
}
