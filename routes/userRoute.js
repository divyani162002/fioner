const express = require("express");

const {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  verifyOTP,
} = require("../controller/userController");


const { protect, admin } = require("../middleware/jwtTken");

const router = express.Router();

// Signup route
router.post("/signup", registerUser);
router.post("/verify-otp", verifyOTP);

// Login route
router.post("/login", loginUser);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Reset Password
router.put('/reset-password/:token', resetPassword);



//admin
router.get("/admin/all", protect, admin, getAllUsers);

router.put("/admin/user/:id", protect, admin, updateUser);
router.delete("/admin/user/:id", protect, admin, deleteUser);






module.exports = router;
