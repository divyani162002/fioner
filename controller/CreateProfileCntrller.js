const CreateProfile = require("../model/createProfileSchema")

exports.createProfile = async (req, res) => {
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
      // Check if user already exists
      const userExists = await CreateProfile.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Regular expression to match the DD/MM/YYYY format
      const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = dateOfBirth.match(datePattern);

      if (!match) {
        throw new Error("Invalid date format. Please use DD/MM/YYYY.");
      }

      // Extract the parts of the date
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // Month is zero-indexed in JS (0 = January)
      const year = parseInt(match[3], 10);

      // Create a valid JavaScript Date object (using Date.UTC to avoid timezone issues)
      const formattedDate = new Date(Date.UTC(year, month, day));

      // Check if the date is valid
      if (isNaN(formattedDate.getTime())) {
        throw new Error("Invalid date value.");
      }

      const newprofile = new CreateProfile({
        name,
        email,
        vehicleNumber,
        additionalVehicleNumbers,
        phoneNumber,
        address,
        dateOfBirth: formattedDate,
        dlNumber,
      });
      newprofile.save();
      return res.status(201).json({
        newprofile,
      });
    } catch (error) {
        console.error(error); // Log the actual error
        res.status(500).json({ message: "user nt created", error: error.message });
    }
    
}

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
