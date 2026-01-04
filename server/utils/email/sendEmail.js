// src/utils/email/sendEmail.js
require("dotenv").config();

const enabled = String(process.env.EMAIL_ENABLED).toLowerCase() === "true";
const provider = String(process.env.EMAIL_PROVIDER || "ses").toLowerCase();
const sendWithSES = require("./sendWithSES");

module.exports = async function sendEmail({ to, subject, html, text }) {
  if (!enabled) return { skipped: true };
  if (provider !== "ses")
    throw new Error(`EMAIL_PROVIDER_NOT_SES: ${provider}`);

  // For SES: pass email only
  const fromEmail = (process.env.FROM_EMAIL || "").trim();

  return await sendWithSES({
    from: fromEmail,
    to,
    subject,
    html,
    text,
  });
};
