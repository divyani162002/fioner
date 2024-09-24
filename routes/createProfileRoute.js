const express = require("express");
const router = express.Router();

const {
  createProfile,
  getProfiles,
  getProfile,
  deleteProfile,
  updateProfile,
  handlePaymentSuccess,
  qrCodeScanHandler,
  // checkRtoDetails,
} = require("../controller/CreateProfileCntrller");

router.post("/", createProfile)
// router.post("/", checkRtoDetails);

router.get("/", getProfiles)
router.get("/:id", getProfile)
router.put("/update/:id", updateProfile)
router.delete("/deleteProfile/:id", deleteProfile);
// Route for handling successful payments and generating QR code
router.post('/payment-success', handlePaymentSuccess);

// Route for handling QR code scans
router.post('/scan-qr', qrCodeScanHandler);
module.exports = router;