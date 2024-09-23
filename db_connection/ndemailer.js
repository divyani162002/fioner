// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log("Sending email to:", options.to); // Log the recipient email
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
};



module.exports = sendEmail;
