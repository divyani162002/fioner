const express = require("express");
const passport = require("passport");
const authController = require("../controller/authController");
const router = express.Router();

// Start Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.googleLogin
);

// Logout user
router.get("/logout", authController.logout);

// Get current authenticated user
router.get("/me", authController.getUser);

module.exports = router;
