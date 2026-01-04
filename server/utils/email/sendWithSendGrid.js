// server/utils/email/sendWithSendGrid.js
require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async function sendWithSendGrid({ from, to, subject, html }) {
  const msg = {
    to,
    from,
    subject: subject || "(no subject)",
    html: html || "",
  };

  const [res] = await sgMail.send(msg);
  console.log(`📧 SendGrid OK (${res.statusCode}) → ${to}`);
  return { provider: "sendgrid", status: res.statusCode };
};
