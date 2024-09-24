const User = require("../model/userSchema");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../db_connection/ndemailer");
// const otpGenerator = require("otp-generator");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETKEY, { expiresIn: "30d" });
};

// Signup function
exports.registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // // Generate an OTP for email verification
    // const otp = otpGenerator.generate(6, {
    //   digits: true,
    //   alphabets: false,
    //   upperCase: false,
    //   specialChars: false,
    // });
    
const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
console.log(otp);
    // Create a new user
    const user = new User({
      name,
      email,
      password,
      otp,
      otpExpires: Date.now() + 3600000, // OTP valid for 1 hour
    });

    await user.save(); // Make sure to await the save operation

    await sendEmail({
      to: user.email,
      subject: "Email Verification OTP",
      text: `Your OTP for verification is: ${otp}`,
    });
    // Return success with JWT
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      message:
        "User registered successfully. Please verify your email using the OTP sent.",
    });
  } catch (error) {
    console.error("Error during signup:", error); // Log detailed error
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user with the provided email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is correct, so clear the OTP fields and activate the user
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isActive = true; // You might want to add an isActive field to your user model
    await user.save();

    // Return success with JWT
    return res.status(200).json({
      message: "Email verified successfully",
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error during OTP verification:", error); // Log the error for debugging
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRETKEY,
      {
        expiresIn: "1h",
      }
    );
    res.json({
      message: "Login successful",
      token: token,
      email: email,
      id: user._id,
    });
  } catch (error) {
    console.error(error); // Log the actual error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password Functionality
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/users/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click this link to reset your password: \n\n ${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password Functionality
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password; // Make sure password is hashed (handled by pre-save)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  const { name, email, isAdmin } = req.body;
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.isAdmin = isAdmin;

      const updatedUser = await user.save();
      res.json({
        message: "User updated successfully",
        updatedUser,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.remove();
      res.json({ message: "User removed successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
