import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const isConfiguredValue = (value) => {
  const normalizedValue = String(value ?? "").trim();
  return Boolean(normalizedValue) && !normalizedValue.startsWith("YOUR_");
};

const isLikelyAwsAccessKeyId = (value) => /^A(?:KIA|SIA)[A-Z0-9]{16}$/.test(String(value ?? "").trim());

const isLikelyAwsSecretAccessKey = (value) => /^[A-Za-z0-9/+=]{40}$/.test(String(value ?? "").trim());

const getSanitizedEnvValue = (key, validator) => {
  const localEnv = readLocalEnvFile();
  const localValue = String(localEnv[key] ?? "").trim();
  const runtimeValue = String(process.env[key] ?? "").trim();
  const candidate = isConfiguredValue(localValue) ? localValue : isConfiguredValue(runtimeValue) ? runtimeValue : "";

  if (!candidate) {
    delete process.env[key];
    return "";
  }

  if (validator && !validator(candidate)) {
    delete process.env[key];
    return "";
  }

  process.env[key] = candidate;
  return candidate;
};

const readLocalEnvFile = () => {
  try {
    const currentFilePath = fileURLToPath(import.meta.url);
    const envPath = path.resolve(path.dirname(currentFilePath), "../../.env");

    if (!fs.existsSync(envPath)) {
      return {};
    }

    const fileContent = fs.readFileSync(envPath, "utf8");
    const parsed = {};

    for (const line of fileContent.split(/\r?\n/)) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const equalsIndex = trimmedLine.indexOf("=");

      if (equalsIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, equalsIndex).trim();
      let value = trimmedLine.slice(equalsIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      parsed[key] = value;
    }

    return parsed;
  } catch {
    return {};
  }
};

const getEnvValue = (key) => {
  const localEnv = readLocalEnvFile();
  const localValue = localEnv[key];
  const runtimeValue = process.env[key];

  return isConfiguredValue(localValue)
    ? String(localValue).trim()
    : isConfiguredValue(runtimeValue)
      ? String(runtimeValue).trim()
      : "";
};

const getSesConfig = () => {
  const awsRegion = getEnvValue("AWS_REGION");
  const awsAccessKeyId = getSanitizedEnvValue("AWS_ACCESS_KEY_ID", isLikelyAwsAccessKeyId);
  const awsSecretAccessKey = getSanitizedEnvValue("AWS_SECRET_ACCESS_KEY", isLikelyAwsSecretAccessKey);
  const awsSessionToken = getSanitizedEnvValue("AWS_SESSION_TOKEN");
  const fromEmail = "sidbixx@gmail.com"; // Fixed verified sender address

  return {
    awsRegion,
    awsAccessKeyId,
    awsSecretAccessKey,
    awsSessionToken,
    fromEmail,
  };
};

const createSesClient = ({ awsRegion, awsAccessKeyId, awsSecretAccessKey, awsSessionToken }) => {
  if (!awsRegion) {
    return null;
  }

  const useExplicitCredentials = isLikelyAwsAccessKeyId(awsAccessKeyId) && isLikelyAwsSecretAccessKey(awsSecretAccessKey);

  return new SESv2Client({
    region: awsRegion,
    ...(useExplicitCredentials
      ? {
          credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsSecretAccessKey,
            ...(isConfiguredValue(awsSessionToken) ? { sessionToken: awsSessionToken } : {}),
          },
        }
      : {}),
  });
};

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const sendJson = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
};

export const applyEmailCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
};

export const handleEmailOptionsRequest = (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return true;
  }

  return false;
};

export const parseJsonBody = (req) => {
  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  return req.body || {};
};

export const getEmailServiceStatus = () => {
  const sesConfig = getSesConfig();

  return {
    fromEmail: sesConfig.fromEmail,
    provider: createSesClient(sesConfig) ? "aws-ses" : null,
  };
};

async function sendViaSes({ to, subject, html, text }) {
  const sesConfig = getSesConfig();
  const sesClient = createSesClient(sesConfig);

  if (!sesClient) {
    throw new Error("AWS SES is not configured");
  }

  if (!sesConfig.fromEmail) {
    throw new Error("From email address is not configured");
  }

  const command = new SendEmailCommand({
    FromEmailAddress: sesConfig.fromEmail,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
          ...(text
            ? {
                Text: {
                  Data: text,
                  Charset: "UTF-8",
                },
              }
            : {}),
        },
      },
    },
  });

  let sendResult;

  try {
    sendResult = await sesClient.send(command);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (/Could not load credentials from any providers/i.test(message)) {
      throw new Error("AWS SES credentials are missing. Set a valid AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or configure AWS_PROFILE/AWS_SESSION_TOKEN.");
    }

    if (/request signature we calculated does not match/i.test(message)) {
      throw new Error("AWS SES signature failed. The AWS secret access key is invalid or incomplete.");
    }

    if (/(Email address is not verified|identity failed the check|domain is not verified|identity must be verified)/i.test(message)) {
      throw new Error(
        "AWS SES cannot send to this recipient because the destination identity is not verified in the selected region. " +
        "If your SES account is in sandbox mode, verify the recipient email or request production access."
      );
    }

    throw error;
  }

  return {
    messageId: sendResult?.MessageId || null,
    provider: "aws-ses",
  };
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields");
  }

  const sesConfig = getSesConfig();

  if (!sesConfig.fromEmail) {
    throw new Error("AWS SES is not configured: missing from email address");
  }

  if (sesConfig.awsRegion) {
    return sendViaSes({ to, subject, html, text });
  }

  throw new Error("Email service is not configured");
}
