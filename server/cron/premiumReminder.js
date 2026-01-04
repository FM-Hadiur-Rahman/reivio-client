const cron = require("node-cron");
const User = require("../models/User");
const sendEmail = require("../utils/email/sendEmail");
const dayjs = require("dayjs");

// Run daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  const threeDaysFromNow = dayjs().add(3, "day").startOf("day").toDate();

  const users = await User.find({
    "premium.isActive": true,
    "premium.expiresAt": {
      $gte: threeDaysFromNow,
      $lt: dayjs(threeDaysFromNow).endOf("day").toDate(),
    },
  });

  for (const user of users) {
    await sendEmail({
      to: user.email,
      subject: "⏰ Your Premium Host plan is about to expire",
      html: `<p>Hi ${
        user.name
      },<br/>Just a reminder that your Premium Host plan will expire on <strong>${dayjs(
        user.premium.expiresAt
      ).format(
        "MMMM D"
      )}</strong>. <br/>Renew now to stay boosted in search results! 🚀</p>`,
    });
    console.log("📧 Reminder sent to", user.email);
  }
});
