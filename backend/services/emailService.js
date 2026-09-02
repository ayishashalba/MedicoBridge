const nodemailer = require("nodemailer");

/**
 * Creates and returns a nodemailer transporter based on environment configuration.
 */
const createTransporter = () => {
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
        return null;
    }

    // Gmail shorthand or custom SMTP host
    if (host && host.includes("gmail")) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user,
                pass,
            },
        });
    }

    return nodemailer.createTransport({
        host: host || "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
};

/**
 * Sends a 6-digit OTP email to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - Plain 6-digit OTP
 * @param {string} [recipientName] - Optional name of user
 */
const sendOtpEmail = async (toEmail, otp, recipientName = "User") => {
    const sender = process.env.EMAIL_FROM || `"MedicoBridge Healthcare" <${process.env.EMAIL_USER || "no-reply@medicobridge.com"}>`;
    const subject = "MedicoBridge Email Verification OTP";

    const textContent = `Hello ${recipientName},

Your MedicoBridge verification OTP is:

${otp}

This OTP will expire in 5 minutes.

If you did not create this account, please ignore this email.

Regards,
MedicoBridge Healthcare Platform`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
        .container { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 14px; }
        .text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #15803d; margin: 0; font-family: 'Courier New', monospace; }
        .otp-expiry { font-size: 13px; color: #64748b; margin-top: 8px; }
        .footer { background: #f1f5f9; padding: 20px 28px; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: center; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MedicoBridge</h1>
          <p>Healthcare Management Platform</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${recipientName},</div>
          <div class="text">
            Your MedicoBridge verification OTP is:
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">This OTP will expire in 5 minutes.</div>
          </div>
          <div class="text">
            If you did not create this account, please ignore this email.
          </div>
        </div>
        <div class="footer">
          Regards,<br>
          <strong>MedicoBridge Healthcare Platform</strong>
        </div>
      </div>
    </body>
    </html>`;

    const transporter = createTransporter();

    if (!transporter) {
        console.log(`\n======================================================`);
        console.log(`[EmailService DEV] Simulated Email to: ${toEmail}`);
        console.log(`[EmailService DEV] Subject: ${subject}`);
        console.log(`[EmailService DEV] OTP Code: ${otp}`);
        console.log(`[EmailService DEV] Note: Set EMAIL_USER & EMAIL_PASSWORD in .env for real SMTP`);
        console.log(`======================================================\n`);
        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail({
            from: sender,
            to: toEmail,
            subject,
            text: textContent,
            html: htmlContent,
        });

        console.log(`[EmailService] OTP email sent to ${toEmail}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[EmailService] Error sending email to ${toEmail}:`, error.message);
        // In development, log the OTP so testing can proceed uninterrupted
        if (process.env.NODE_ENV === "development") {
            console.log(`[EmailService DEV Fallback] OTP for ${toEmail}: ${otp}`);
        }
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOtpEmail,
};
