const express = require("express");
const router = express.Router();

const{sendOTPController,verifyOTPController} = require("../controller/mobileOtpController")

//
router.post("/send-otp", sendOTPController);
router.post("/verify-otp", verifyOTPController);



module.exports = router;