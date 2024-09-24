const CreateProfile = require("../model/createProfileSchema")
const Razorpay = require("razorpay");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
// const { checkRtoDetails } = require("../db_connection/rtoService");

// exports.createProfile = async (req, res) => {
//     const {
//       name,
//       email,
//       vehicleNumber,
//       additionalVehicleNumbers,
//       phoneNumber,
//       address,
//       dateOfBirth,
//       dlNumber,
//     } = req.body;

//     try {
//       // Check if user already exists
//       const userExists = await CreateProfile.findOne({ email });
//       if (userExists) {
//         return res.status(400).json({ message: "User already exists" });
//       }

//       // Regular expression to match the DD/MM/YYYY format
//       const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
//       const match = dateOfBirth.match(datePattern);

//       if (!match) {
//         throw new Error("Invalid date format. Please use DD/MM/YYYY.");
//       }

//       // Extract the parts of the date
//       const day = parseInt(match[1], 10);
//       const month = parseInt(match[2], 10) - 1; // Month is zero-indexed in JS (0 = January)
//       const year = parseInt(match[3], 10);

//       // Create a valid JavaScript Date object (using Date.UTC to avoid timezone issues)
//       const formattedDate = new Date(Date.UTC(year, month, day));

//       // Check if the date is valid
//       if (isNaN(formattedDate.getTime())) {
//         throw new Error("Invalid date value.");
//       }

//       const newprofile = new CreateProfile({
//         name,
//         email,
//         vehicleNumber,
//         additionalVehicleNumbers,
//         phoneNumber,
//         address,
//         dateOfBirth: formattedDate,
//         dlNumber,
//       });
//       newprofile.save();
//       return res.status(201).json({
//         newprofile,
//       });
//     } catch (error) {
//         console.error(error); // Log the actual error
//         res.status(500).json({ message: "user nt created", error: error.message });
//     }
    
// }

exports.getProfiles = async (req, res)=>{
    try {
        const useProfile = await CreateProfile.find();

        return res.status(201).json({
          useProfile,
        });
    } catch (error) {
        console.error(error); // Log the actual error
        res
          .status(500)
          .json({ message: "users nt created", error: error.message });
    }
}


exports.getProfile = async (req, res) => {
    const id = req.params.id
    try {
        const getProfile = await CreateProfile.findById({ id });
        return res.status(200).json({
            getProfile
        }
        )
    } catch (error) {
         console.error(error); // Log the actual error
         res
           .status(500)
           .json({ message: "users not found", error: error.message });
    }
}

exports.deleteProfile = async (req, res) => {
    const id = req.params.id
    console.log(id);

    try { 
        if (!id) {
            return res.status(400).json({
                msg: "id not found",
            });
        }
        const deleteProfile = await CreateProfile.findByIdAndDelete({ id })
        return res.status(200).json({
          message: "profile is deleted",
          deleteProfile
        });
        
    } catch (error) {
          console.error(error); // Log the actual error
          res
            .status(500)
            .json({ message: "users not delete", error: error.message });
    }
}

exports.updateProfile = async (req, res) => {
  const {
    name,
    email,
    vehicleNumber,
    additionalVehicleNumbers,
    phoneNumber,
    address,
    dateOfBirth,
    dlNumber,
  } = req.body;

  try {
    // Find the user by ID (assuming req.user contains the authenticated user's ID)
    const user = await CreateProfile.findById(req.params.id); // Or use req.user._id if user is authenticated

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.vehicleNumber = vehicleNumber || user.vehicleNumber;
    user.additionalVehicleNumbers =
      additionalVehicleNumbers || user.additionalVehicleNumbers;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.dlNumber = dlNumber || user.dlNumber;

    // Save the updated user profile
    const updatedUser = await user.save();

    res.json({
      message: "User profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
};




// Setup Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Handle payment and QR code generation
exports.handlePaymentSuccess = async (req, res) => {
  const { razorpayPaymentId, userId } = req.body;

  try {
    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Find the user and update their subscription status
    const user = await CreateProfile.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a QR code for the user
    const qrData = JSON.stringify({
      vehicleNo: user.vehicleNo,
      mobileNo: user.mobileNo,
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Update the user's subscription and QR code details
    user.qrCode = qrCodeUrl;
    user.qrCodeActive = true;
    user.subscriptionStatus = "active";
    user.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days subscription
    await user.save();

    res.status(200).json({
      message: "Subscription successful, QR code generated",
      qrCodeUrl: qrCodeUrl,
    });
  } catch (error) {
    console.error("Error handling payment", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.qrCodeScanHandler = async (req, res) => {
  const { userId } = req.body; // Extract user ID from the scanned QR code data

  try {
    const user = await User.findById(userId);

    if (!user || !user.qrCodeActive) {
      return res
        .status(403)
        .json({
          message: "QR code is inactive. Please renew your subscription.",
        });
    }

    // Proceed with forwarding the details to the service team
    // Email or notify the service team with user details
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.SERVICE_TEAM_EMAIL,
      subject: "QR Code Scan: Vehicle Service Request",
      text: `Vehicle No: ${user.vehicleNo}\nMobile No: ${user.mobileNo}`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({
        message: "QR code is valid. Details forwarded to the service team.",
      });
  } catch (error) {
    console.error("Error handling QR scan", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






exports.createProfile = async (req, res) => {
  const {
    name,
    email,
    reg_no,
    additionalVehicleNumbers,
    phoneNumber,
    address,
    dateOfBirth,
    dlNumber,
  } = req.body;

  try {
    // Check if user already exists
    const userExists = await CreateProfile.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if vehicleNumber is present
    if (!reg_no) {
      return res.status(400).json({ message: "Vehicle number is required" });
    }

    // Call RTO API to validate the vehicle details
    let rtoValidation;
    try {
      rtoValidation = await checkRtoDetails(reg_no);
      console.log(rtoValidation);
    } catch (error) {
      console.error("Error validating vehicle details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return res.status(400).json({
        isValid: false,
        message:
          error.response?.data?.message ||
          "Failed to validate vehicle details with RTO",
      });
    }

    // If RTO validation fails
    if (!rtoValidation.isValid) {
      return res.status(400).json({
        message: rtoValidation.message || "RTO validation failed",
      });
    }

    // Validate dateOfBirth format (DD/MM/YYYY)
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateOfBirth.match(datePattern);

    if (!match) {
      return res.status(400).json({
        message: "Invalid date format. Please use DD/MM/YYYY.",
      });
    }

    // Extract day, month, year and create a JavaScript Date object
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is zero-indexed
    const year = parseInt(match[3], 10);
    const formattedDate = new Date(Date.UTC(year, month, day));

    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date value." });
    }

    // Create and save the profile if all validations pass
    const profile = new CreateProfile({
      name,
      email,
      reg_no,
      additionalVehicleNumbers,
      phoneNumber,
      address,
      dateOfBirth: formattedDate, // Store the formatted Date object
      dlNumber,
    });

    await profile.save();

    res.status(201).json({
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const axios = require("axios");
require("dotenv").config();

const checkRtoDetails = async (reg_no) => {
  try {
        // Make a request to the RTO API
        const response = await axios.post(
          `https://rto-vehicle-information-verification-india.p.rapidapi.com/api/v1/rc/vehicleinfo`,
          {
            headers: {
              "x-rapidapi-key":
                "d2ec2c254amsh7d2d428d3d99948p15304djsn3d430c383822",
              "x-rapidapi-host":
                "rto-vehicle-information-verification-india.p.rapidapi.com",
              "Content-Type": "application/json",
            },
            body: {
              reg_no: reg_no,
              consent: "Y",
              consent_text:
                "I hear by declare my consent agreement for fetching my information via AITAN Labs API",
            },
          }
        );
        console.log(response);
        if (response.data && response.data.status === "success") {
            console.log()
            return { isValid: true };
        } else {
            return { isValid: false, message: "Vehicle not found or invalid" };
        }
  } catch (error) {
    console.error(
      "Error validating vehicle details:",
      error.response ? error.response.data : error.message
    );
    return {
      isValid: false,
      message:
        error.response?.data?.message ||
        "Failed to validate vehicle details with RTO",
    };
  }
};



