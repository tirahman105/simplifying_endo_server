const { Resend } = require("resend");

// ✅ API Key check
if (!process.env.RESEND_API_KEY) {
  console.log("❌ RESEND_API_KEY missing in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Registration confirmation email
const sendRegistrationEmail = async (studentData) => {
  try {
    console.log("📧 Attempting Resend email to:", studentData.email);
    console.log("🔑 API Key available:", !!process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Simplifying Endo <onboarding@resend.dev>",
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
              <p>Thank you for registering for our <strong>Simplifying Endo 2 days Comprehensive hands-on program!</strong></p>
              
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
              
              <p>✅ <strong>Your registration has been received successfully.</strong></p>
              <p>We will review your application and contact you within 24-48 hours.</p>
              
              <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>📞 Contact Information:</strong></p>
                <p>Phone: +8801716282031</p>
                <p>Email: course.confirmation.mail@gmail.com</p>
              </div>
                 
              <p>Best regards,<br><strong>Simplifying Endo Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Simplifying Endo by Dr. Razib Hossen. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.log("❌ Resend error details:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Resend success! Email ID:", data.id);
    return { success: true, data };
  } catch (error) {
    console.log("❌ Catch error:", error.message);
    return { success: false, error: error.message };
  }
};

// Admin notification email - ✅ ADD THIS FUNCTION
const sendAdminNotification = async (studentData) => {
  try {
    console.log("📧 Attempting to send admin notification via Resend");

    // Get admin emails from environment variable
    const adminEmailsFromEnv = process.env.ADMIN_EMAILS || "admin@dental.com";
    const adminEmails = adminEmailsFromEnv
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    const { data, error } = await resend.emails.send({
      from: "Simplifying Endo System <onboarding@resend.dev>",
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
            .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📋 New Student Registration</h2>
            </div>
            <div class="content">
              <p><strong>A new student has registered for the Simplifying Endo training program:</strong></p>
              
              <div class="student-info">
                <h3 style="color: #1F2937; margin-top: 0;">Student Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>👤 Name:</strong> ${studentData.name}</li>
                  <li><strong>📧 Email:</strong> ${studentData.email}</li>
                  <li><strong>📱 Mobile:</strong> ${studentData.mobile}</li>
                  <li><strong>🎓 College:</strong> ${
                    studentData.dentalCollege
                  }</li>
                  <li><strong>🆔 BMDC:</strong> ${studentData.bmdc}</li>
                  <li><strong>⏰ Registration Time:</strong> ${new Date().toLocaleString(
                    "en-BD",
                    { timeZone: "Asia/Dhaka" }
                  )}</li>
                </ul>
              </div>
              
              <p>Please check the admin panel for more details and to assign batches.</p>
              
              <a href="https://drrazib.netlify.app/admin/login" class="button">
                🔗 Go to Admin Panel
              </a>
              
              <p style="color: #6B7280; font-size: 12px; margin-top: 20px;">
                This is an automated notification from Simplifying Endo System.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.log("❌ Resend admin error:", error);
      return { success: false, error: error.message };
    }

    console.log(
      "✅ Admin notifications sent via Resend to:",
      adminEmails.join(", ")
    );
    return { success: true, data };
  } catch (error) {
    console.log("❌ Admin email failed:", error);
    return { success: false, error: error.message };
  }
};

// ✅ CORRECT EXPORTS - both functions are now defined
module.exports = {
  sendRegistrationEmail,
  sendAdminNotification,
};
