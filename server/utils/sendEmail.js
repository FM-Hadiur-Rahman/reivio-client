// // server/utils/email.js
// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // e.g., banglabnb@gmail.com
//     pass: process.env.EMAIL_PASS, // your Google App Password
//   },
// });

// const sendEmail = async ({ to, subject, html, attachments }) => {
//   const mailOptions = {
//     from: `"BanglaBnB" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//     attachments,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`📧 Email sent to ${to}`);
//   } catch (error) {
//     console.error("❌ Failed to send email:", error);
//   }
// };

// module.exports = sendEmail;

// server/utils/sendEmail.js

// server/utils/sendEmail.js (CommonJS)
require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const enabled = String(process.env.EMAIL_ENABLED).toLowerCase() === "true";
if (enabled) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function parseFrom() {
  const raw = (process.env.FROM_EMAIL || "").trim();
  const m = /^(.*)<\s*([^<>@\s]+@[^<>@\s]+)\s*>$/.exec(raw);
  if (m) return { name: m[1].trim().replace(/^"|"$/g, ""), email: m[2].trim() };
  return { email: raw, name: undefined };
}
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");

module.exports = async function sendEmail({ to, subject, html }) {
  if (!enabled) return { skipped: true };

  const from = parseFrom();
  if (!isEmail(from.email)) throw new Error("INVALID_FROM_EMAIL_ENV");
  if (!isEmail(to)) throw new Error("INVALID_TO_EMAIL");

  const msg = {
    to,
    from,
    subject: subject || "(no subject)",
    html: html || "",
  };
  console.log("DEBUG from:", from, "DEBUG to:", to);

  try {
    const [res] = await sgMail.send(msg);
    console.log(`📧 SendGrid OK (${res.statusCode}) → ${to}`);
    return res;
  } catch (err) {
    const body = err.response?.body;
    console.error(
      "❌ SendGrid error detail:",
      JSON.stringify(body?.errors || body || err, null, 2)
    );
    throw err;
  }
};
