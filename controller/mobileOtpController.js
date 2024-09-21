
const { sendOTP } = require("../db_connection/twilioService");


// Generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
};

 exports.sendOTPController = async (req, res) => {
  const { phoneNumber } = req.body; // User's phone number
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const otp = generateOTP();
  try {
    await sendOTP(phoneNumber, otp);
    // Store the OTP in the user's session or a database
    req.session.otp = otp;
    req.session.phoneNumber = phoneNumber;
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};




 exports.verifyOTPController = (req, res) => {
   const { otp } = req.body; // OTP entered by the user
   if (req.session.otp && req.session.otp === otp) {
     return res.status(200).json({ message: "OTP verified successfully" });
   } else {
     return res.status(400).json({ message: "Invalid OTP" });
   }
 };
