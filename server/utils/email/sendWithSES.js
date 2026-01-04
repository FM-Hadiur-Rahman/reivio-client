// src/utils/email/sendWithSES.js
require("dotenv").config();

const isEmail = (s) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

module.exports = async function sendWithSES({ from, to, subject, html, text }) {
  // Lazy-load to avoid boot crash
  const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

  const region = process.env.AWS_REGION;
  const fromEmail = String(from || "").trim(); // MUST be email-only for SES
  const toEmail = String(to || "").trim();

  if (!isEmail(fromEmail)) throw new Error(`INVALID_FROM_EMAIL: ${fromEmail}`);
  if (!isEmail(toEmail)) throw new Error(`INVALID_TO_EMAIL: ${toEmail}`);

  const ses = new SESv2Client({ region });

  const cmd = new SendEmailCommand({
    FromEmailAddress: fromEmail, // ✅ email-only
    ReplyToAddresses: [fromEmail],
    Destination: { ToAddresses: [toEmail] },
    Content: {
      Simple: {
        Subject: { Data: subject || "(no subject)", Charset: "UTF-8" },
        Body: {
          Html: { Data: html || "", Charset: "UTF-8" },
          Text: { Data: text || "", Charset: "UTF-8" },
        },
      },
    },
  });

  const res = await ses.send(cmd);
  console.log(`📧 SES OK (MessageId=${res.MessageId}) → ${toEmail}`);
  return { provider: "ses", messageId: res.MessageId };
};
