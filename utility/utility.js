const nodemailer = require("nodemailer");

/**
 * Generate a random numeric OTP of given length. Default length is 6.
 */
module.exports.generateOTP = (length = 6) => {
  var result = "";
  var characters = "0123456789";
  var charLen = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * charLen)];
  }
  return result;
};

/**
 * Uses Nodemailer for sending emails
 * Configuration is done via Gmail SMTP
 * Note: Change password in .env for ensuring no errors while sending email. The password is a APP Password key of your gmail account.
 */
module.exports.sendEmail = (email, subject, message) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject,
      html: `<p>${message}</p>`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(`Email Error: ${err}`);
        resolve(false);
      } else {
        console.log("Email sent");
        resolve(true);
      }
    });
  });
};

/**
 * Email Template for OTP
 */
module.exports.emailTemplateOTP = (name, otp, link) => {
  return `<body style="font-family: Arial, sans-serif; background-color: rgb(38, 50, 56); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; width: 100%;">
  <div style="background-color: rgb(55, 71, 79); width: 600px; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; margin: 2rem auto;">
    <div style="border-bottom: 1px solid #b0bec5; padding-bottom: 10px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 24px; color: rgb(255, 138, 101);">Verify Your Email Address</h1>
    </div>
    <div style="font-size: 16px; color: rgb(255, 255, 255); text-align: left;">
      <p style="margin: 10px 0;">Dear ${name},</p>
      <p style="margin: 10px 0;">
        Thank you for registering with us. Please visit the link below to
        verify your email address by entering the OTP provided:
      </p>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <a href="${link}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; font-size: 16px; color: rgb(255, 138, 101); background-color: transparent; border: 1px solid rgba(255, 137, 101, 0.5); border-radius: 5px; text-decoration: none;" onMouseOver="this.style.backgroundColor='rgba(255, 137, 101, 0.1)'; this.style.border='1px solid rgba(255, 138, 101, 0.8)'; this.style.color='rgb(255, 138, 101)';" onMouseOut="this.style.backgroundColor='transparent'; this.style.border='1px solid rgba(255, 137, 101, 0.5)'; this.style.color='rgb(255, 138, 101)';">Go to Verification Page</a>
      </div>
      <p style="margin: 10px 0;">Use the following OTP code to verify your email:</p>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <p style="display: inline-block; padding: 10px 20px; font-size: 18px; font-weight: bold; color: rgb(255, 138, 101); background-color: transparent; border-radius: 5px; margin: 20px auto; border: 1px solid rgba(255, 137, 101, 0.5);">${otp}</p>
      </div>
      <p style="margin: 10px 0;">Best Regards,</p>
      <p style="margin: 10px 0;">Hubbie Chat</p>
    </div>
    <div style="border-top: 1px solid #b0bec5; padding-top: 10px; margin-top: 20px; font-size: 12px; color: #999999;">
      <p>&copy; 2024 Hubbie Chat. All rights reserved.</p>
    </div>
  </div>
</body>
`;
};

/**
 * Email Template for resetting password
 */
module.exports.emailTemplateResetPassword = (name, link) => {
  return `<body style="font-family: Arial, sans-serif; background-color: rgb(38, 50, 56); margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; width: 100%;">
  <div style="background-color: rgb(55, 71, 79); width: 600px; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center;margin: 2rem auto">
    <div style="border-bottom: 1px solid #b0bec5; padding-bottom: 10px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 24px; color: rgb(255, 138, 101);">Reset your password</h1>
    </div>
    <div style="font-size: 16px; color: rgb(255, 255, 255); text-align: left;">
      <p style="margin: 10px 0;">Dear ${name},</p>
      <p style="margin: 10px 0;">
        We received a request to reset your password. Please click the link below to reset your password:
      </p>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <a href="${link}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; font-size: 16px; color: rgb(255, 138, 101); background-color: transparent; border: 1px solid rgba(255, 137, 101, 0.5); border-radius: 5px; text-decoration: none;" onMouseOver="this.style.backgroundColor='rgba(255, 137, 101, 0.1)'; this.style.border='1px solid rgba(255, 138, 101, 0.8)'; this.style.color='rgb(255, 138, 101)';" onMouseOut="this.style.backgroundColor='transparent'; this.style.border='1px solid rgba(255, 137, 101, 0.5)'; this.style.color='rgb(255, 138, 101)';">Reset Password Link</a>
      </div>
      <p style="margin: 10px 0 20px 0;">
        If you did not request a password reset, please ignore this email or contact support if you have questions.
      </p>
      <p style="margin: 10px 0;">Best Regards,</p>
      <p style="margin: 10px 0;">Hubbie Chat</p>
    </div>
    <div style="border-top: 1px solid #b0bec5; padding-top: 10px; margin-top: 20px; font-size: 12px; color: #999999;">
      <p>&copy; 2024 Hubbie Chat. All rights reserved.</p>
    </div>
  </div>
</body>`;
};
