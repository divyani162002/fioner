const cron = require("node-cron");
const CreateProfile = require("../model/createProfileSchema");

// Cron job to disable expired subscriptions
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const expiredUsers = await CreateProfile.find({
      subscriptionEndDate: { $lt: now },
      subscriptionStatus: "active",
    });

    expiredUsers.forEach(async (user) => {
      user.subscriptionStatus = "expired";
      user.qrCodeActive = false;
      await user.save();
      console.log(`Disabled QR code for expired subscription: ${user.email}`);
    });
  } catch (error) {
    console.error("Error running cron job", error);
  }
});
