import {
  applyEmailCorsHeaders,
  escapeHtml,
  handleEmailOptionsRequest,
  parseJsonBody,
  sendEmail,
  sendJson,
} from "./_lib/email.js";

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
              <a href="https://bioenergy-global.com/my-badge" class="button">View My Badge Online</a>
            </p>
            
            <div class="footer">
              <p>Need help? Contact us at support@bioenergy-global.com or WhatsApp: +91-XXXX-XXXX-XXXX</p>
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

  const { email, name, qrCodeUrl, registrationCode, role, badgeId } = parsedBody;

  // Validation
  if (!email || !name || !qrCodeUrl || !registrationCode || !role) {
    return sendJson(res, 400, {
      error: "Missing required fields: email, name, qrCodeUrl, registrationCode, role",
    });
  }

  try {
    const htmlContent = getEmailTemplate(name, registrationCode, role, qrCodeUrl);

    const result = await sendEmail({
      to: email,
      subject: `Your Bioenergy Expo 2026 Badge - ${registrationCode}`,
      html: htmlContent,
      text: `Dear ${name}, your Bioenergy Expo 2026 badge is ready. Registration code: ${registrationCode}.`,
    });

    return sendJson(res, 200, {
      success: true,
      message: "Badge email sent successfully",
      badgeId,
      email,
      emailId: result.messageId || null,
      provider: result.provider,
    });
  } catch (error) {
    console.error("Error sending badge email:", error);
    return sendJson(res, 500, {
      error: "Failed to send badge email",
      details:
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && "message" in error
            ? String(error.message)
            : "Unknown error",
    });
  }
}
