const nodemailer = require("nodemailer");

// Create transporter with Render-optimized settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  // ✅ Render.com optimization
  pool: true,
  maxConnections: 1,
  socketTimeout: 30000,
  connectionTimeout: 30000,
  secure: true,
});

// Registration confirmation email
const sendRegistrationEmail = async (studentData) => {
  try {
    console.log("📧 Attempting to send email to:", studentData.email);

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
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; padding: 20px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Simplifying Endo</h1>
            </div>
            <div class="content">
              <h2>Dear ${studentData.name},</h2>
              <p>Thank you for registering for our Simplifying Endo 2 days Comprehensive hands on program!</p>
              
              <div class="details">
                <h3>📋 Registration Details:</h3>
                <ul>
                  <li><strong>Name:</strong> ${studentData.name}</li>
                  <li><strong>Email:</strong> ${studentData.email}</li>
                  <li><strong>Mobile:</strong> ${studentData.mobile}</li>
                  <li><strong>Dental College:</strong> ${studentData.dentalCollege}</li>
                  <li><strong>Session:</strong> ${studentData.session}</li>
                  <li><strong>BMDC:</strong> ${studentData.bmdc}</li>
                </ul>
              </div>
              
              <p>✅ Your registration has been received successfully.</p>
              <p>We will review your application and contact you within 24-48 hours.</p>
              
              <p><strong>📞 Contact Information:</strong></p>
              <p>Phone: +8801716282031</p>
                 
              <p>Best regards,<br>Simplifying Endo Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Simplifying Endo by Dr. Razib Hossen. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Registration email sent to:", studentData.email);
    return result;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Don't throw error for Render.com
    return null;
  }
};

// Admin notification email - DYNAMIC MULTIPLE ADMINS
const sendAdminNotification = async (studentData) => {
  try {
    console.log("📧 Attempting to send admin notification");

    // Get admin emails from environment variable (comma separated)
    const adminEmailsFromEnv = process.env.ADMIN_EMAILS || "admin@dental.com";

    // Split by comma and remove any spaces
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
      subject: "🆕 New Student Registration - Simplifying Endo",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 25px; background: #f9f9f9; }
            .student-info { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3B82F6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📋 New Student Registration</h2>
            </div>
            <div class="content">
              <p><strong>A new student has registered for the training program:</strong></p>
              
              <div class="student-info">
                <h3>Student Details:</h3>
                <ul>
                  <li><strong>Name:</strong> ${studentData.name}</li>
                  <li><strong>Email:</strong> ${studentData.email}</li>
                  <li><strong>Mobile:</strong> ${studentData.mobile}</li>
                  <li><strong>College:</strong> ${
                    studentData.dentalCollege
                  }</li>
                  <li><strong>BMDC:</strong> ${studentData.bmdc}</li>
                  <li><strong>Registration Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
              </div>
              
              <p>Please check the admin panel for more details and to assign batches.</p>
              <p><a href="https://drrazib.netlify.app/admin/login" style="color: #3B82F6;">Go to Admin Panel</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Admin notifications sent to:", adminEmails);
  } catch (error) {
    console.error("❌ Admin email failed:", error.message);
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error.message);
    return false;
  }
};

module.exports = {
  sendRegistrationEmail,
  sendAdminNotification,
  testEmailConnection,
};
