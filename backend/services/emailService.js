const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

/**
 * Send OTP Email to user
 * @param {string} to - Recipient email
 * @param {string} otp - 6 digit OTP
 * @param {string} role - Role of user
 */
const sendOtpEmail = async (to, otp, role = 'User') => {
  const subject = `[MedicoBridge] Your Email Verification Code: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #0284c7; margin: 0;">MedicoBridge</h1>
        <p style="color: #64748b; margin-top: 4px;">Smart Healthcare Management Platform</p>
      </div>
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 6px;">
        <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #475569; font-size: 15px;">
          Thank you for registering as a <strong>${role}</strong> on MedicoBridge. Please use the verification code below to activate your account:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0284c7; background: #e0f2fe; padding: 12px 24px; border-radius: 6px; border: 1px dashed #38bdf8;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">
          This code is valid for 10 minutes. If you did not request this registration, please disregard this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} MedicoBridge Healthcare. All rights reserved.
      </div>
    </div>
  `;

  try {
    if (!transporter) {
      transporter = createTransporter();
    }

    if (transporter) {
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'MedicoBridge Security'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`[EmailService] OTP email sent successfully to ${to}`);
    } else {
      console.log(`\n======================================================`);
      console.log(`[DEV OTP EMAIL] To: ${to} | Role: ${role}`);
      console.log(`[DEV OTP EMAIL] Code: ${otp}`);
      console.log(`======================================================\n`);
    }
    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error.message);

    // Show OTP in terminal during development
    console.log(`[DEV FALLBACK OTP] To: ${to} | Code: ${otp}`);

    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};
