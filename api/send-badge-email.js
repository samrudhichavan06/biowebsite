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

function getEmailTemplate(name, registrationCode, role, qrCodeUrl) {
  const roleLabel = {
    visitor: "Visitor",
    delegate: "Delegate",
    exhibitor: "Exhibitor",
  }[role] || role;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .badge-section { text-align: center; margin: 30px 0; }
          .qr-code { display: inline-block; padding: 15px; background: white; border: 2px solid #667eea; border-radius: 8px; }
          .qr-code img { max-width: 300px; height: auto; }
          .registration-code { font-size: 18px; font-weight: bold; color: #667eea; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Bioenergy Expo 2026 Badge</h1>
            <p>Registration Confirmed - ${roleLabel}</p>
          </div>
          <div class="content">
            <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
            <p>Thank you for registering for Bioenergy Expo 2026! Your badge has been generated and is ready to use.</p>
            
            <div class="badge-section">
              <h3>Your Registration Badge</h3>
              <div class="qr-code">
                <img src="${qrCodeUrl}" alt="Badge QR Code" />
              </div>
              <div class="registration-code">
                Registration Code: ${escapeHtml(registrationCode)}
              </div>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Download this email or take a screenshot of your badge</li>
              <li>Show your QR code at the registration desk for quick check-in</li>
              <li>Your registration code is unique - keep it safe</li>
              <li>Visit your dashboard for more information and resources</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="https://bioenergy-expo.com/my-badge" class="button">View My Badge Online</a>
            </p>
            
            <div class="footer">
              <p>Need help? Contact us at support@bioenergy-expo.com or WhatsApp: +91-XXXX-XXXX-XXXX</p>
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

  const { email, name, qrCodeUrl, registrationCode, role, badgeId } = parsedBody;

  // Validation
  if (!email || !name || !qrCodeUrl || !registrationCode || !role) {
    return sendJson(res, 400, {
      error: "Missing required fields: email, name, qrCodeUrl, registrationCode, role",
    });
  }

  // Check if email service is configured
  if (!sesClient || !fromEmail) {
    console.warn("Email service not configured. Badge email would have been sent to:", email);
    // Return success anyway for development
    return sendJson(res, 200, {
      success: true,
      message: "Badge email queued (service not configured in this environment)",
      badgeId,
    });
  }

  try {
    const htmlContent = getEmailTemplate(name, registrationCode, role, qrCodeUrl);

    const command = new SendEmailCommand({
      FromEmailAddress: fromEmail,
      Destination: {
        ToAddresses: [email],
      },
      Content: {
        Simple: {
          Subject: {
            Data: `Your Bioenergy Expo 2026 Badge - ${registrationCode}`,
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
      message: "Badge email sent successfully",
      badgeId,
      email,
    });
  } catch (error) {
    console.error("Error sending badge email:", error);
    return sendJson(res, 500, {
      error: "Failed to send badge email",
      details: error.message,
    });
  }
}
