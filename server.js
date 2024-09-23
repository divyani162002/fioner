const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
require("./controller/cronJob"); 
require("dotenv").config();
const { errorHandler, notFound } = require("./middleware/errHandler");


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = process.env.PORT || 5000;


app.get("/", (req, res) => {
  // console.log("server is running");
  res.send("Server is running");
});

app.use(cors());
// Routes
const userRoutes = require("./routes/userRoute")
app.use('/api/users', userRoutes);

const profileRoutes = require("./routes/createProfileRoute");
app.use("/api/userProfile", profileRoutes);

//mobile Otp
const mobileOtpRoute = require("./routes/mobileOtpRoute")
app.use("/api/mobileOtp",mobileOtpRoute)

app.use(errorHandler);
app.use(notFound);




// database connection
const connect_DB = require("./db_connection/config")
connect_DB()

// server connection
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
