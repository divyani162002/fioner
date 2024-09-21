const express = require("express");
const router = express.Router();

const { createProfile, getProfiles, getProfile, deleteProfile, updateProfile } = require("../controller/CreateProfileCntrller")

router.post("/", createProfile)
router.get("/", getProfiles)
router.get("/:id", getProfile)
router.put("/update/:id", updateProfile)
router.delete("/deleteProfile/:id", deleteProfile);
module.exports = router;