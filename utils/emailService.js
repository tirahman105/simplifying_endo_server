const nodemailer = require("nodemailer");

// Render-optimized Gmail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use port 587 (not 465)
  secure: false, // false for port 587
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // ✅ Render.com-specific optimizations
  connectionTimeout: 15000, // 15 seconds
  greetingTimeout: 15000,
  socketTimeout: 15000,
  pool: false, // Single connection (Render free tier limitation)
  maxConnections: 1,
  maxMessages: 1,
  debug: true, // See what's happening
  logger: true,
});

const sendRegistrationEmail = async (studentData) => {
  try {
    console.log("📧 Attempting to send Gmail to:", studentData.email);

    const mailOptions = {
      from: {
        name: "Simplifying Endo",
        address: process.env.GMAIL_USER,
      },
      to: studentData.email,
      subject: "🎉 Simplifying Endo Registration Successful",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: #3B82F6; color: white; padding: 25px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Simplifying Endo</h1>
            </div>
            <div class="content">
              <h2>Dear ${studentData.name},</h2>
              <p>Thank you for registering!</p>
              <p>We will contact you within 24-48 hours.</p>
              <p>Phone: +8801716282031</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // ✅ Quick send with timeout
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gmail timeout")), 10000)
      ),
    ]);

    console.log("✅ Gmail sent successfully to:", studentData.email);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Gmail failed:", error.message);
    return { success: false, error: error.message };
  }
};

const sendAdminNotification = async (studentData) => {
  try {
    console.log("📧 Attempting to send admin Gmail");

    const adminEmailsFromEnv = process.env.ADMIN_EMAILS || "admin@dental.com";
    const adminEmails = adminEmailsFromEnv
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0)
      .join(", ");

    const mailOptions = {
      from: {
        name: "Simplifying Endo System",
        address: process.env.GMAIL_USER,
      },
      to: adminEmails,
      subject: "🆕 New Student Registration",
      html: `
        <div>
          <h2>New Student Registration</h2>
          <p><strong>Name:</strong> ${studentData.name}</p>
          <p><strong>Email:</strong> ${studentData.email}</p>
          <p><strong>Mobile:</strong> ${studentData.mobile}</p>
        </div>
      `,
    };

    // ✅ Quick send with timeout
    await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gmail timeout")), 20000)
      ),
    ]);

    console.log("✅ Admin Gmail sent to:", adminEmails);
    return { success: true };
  } catch (error) {
    console.error("❌ Admin Gmail failed:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRegistrationEmail,
  sendAdminNotification,
};
