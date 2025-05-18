import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};


export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Champions Arena" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verification Code for Champions Arena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #0d84c3; text-align: center;">Champions Arena</h2>
          <p>Hello,</p>
          <p>Thank you for registering with Champions Arena. Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>Champions Arena Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send welcome email to user
 * @param {string} email - User's email
 * @param {string} username - User's username
 * @returns {Promise<boolean>} - Success status
 */
export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Champions Arena" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Champions Arena!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #0d84c3; text-align: center;">Champions Arena</h2>
          <p>Hello ${username},</p>
          <p>Welcome to Champions Arena! Your account has been successfully verified.</p>
          <p>You can now enjoy all the features of our platform:</p>
          <ul>
            <li>Participate in exciting tournaments</li>
            <li>Track your progress and statistics</li>
            <li>Connect with other gamers</li>
            <li>Win amazing prizes</li>
          </ul>
          <p>We're excited to have you join our gaming community!</p>
          <p>Best regards,<br>Champions Arena Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send verification email with OTP
 * @param {string} email - User's email
 * @param {string} otp - One-time password
 * @param {string} purpose - Purpose of OTP (verification or password reset)
 * @returns {Promise<boolean>} - Success status
 */
export const sendVerificationEmail = async (email, otp, purpose = "Verification") => {
  try {
    const transporter = createTransporter();
    
    let subject, heading, message;
    
    if (purpose === "Password Reset") {
      subject = "Password Reset Code for Champions Arena";
      heading = "Password Reset";
      message = "You requested to reset your password. Please use the following code:";
    } else {
      subject = "Verification Code for Champions Arena";
      heading = "Account Verification";
      message = "Thank you for registering with Champions Arena. Please use the following verification code:";
    }
    
    const mailOptions = {
      from: `"Champions Arena" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #0d84c3; text-align: center;">Champions Arena</h2>
          <h3 style="color: #333; text-align: center;">${heading}</h3>
          <p>Hello,</p>
          <p>${message}</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>Champions Arena Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`${purpose} email sent: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`Error sending ${purpose.toLowerCase()} email:`, error);
    return false;
  }
};

/**
 * Send password reset email with reset link
 * @param {string} email - User's email
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<boolean>} - Success status
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Champions Arena" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset for Champions Arena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #0d84c3; text-align: center;">Champions Arena</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your Champions Arena account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0d84c3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>This link will expire in 10 minutes.</p>
          <p>Best regards,<br>Champions Arena Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};