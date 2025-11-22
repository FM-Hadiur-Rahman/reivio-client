require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// If (and only if) you’re on an EU subuser, uncomment this:
// sgMail.setDataResidency('eu');

const FROM = process.env.FROM_EMAIL || "routeroof@gmail.com"; // must be verified
const TO = process.env.TEST_TO || "yourpersonal@gmail.com";

sgMail
  .send({
    to: TO,
    from: { email: FROM, name: "Routeroof" },
    subject: "SendGrid ping ✅",
    html: "<p>It works.</p>",
  })
  .then((r) => console.log("OK", r[0].statusCode)) // expect 202
  .catch((e) => console.error("ERR", e.response?.body || e));
