const { Resend } = require("resend");

// ✅ API Key check
if (!process.env.RESEND_API_KEY) {
  console.log("❌ RESEND_API_KEY missing in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const sendRegistrationEmail = async (studentData) => {
  try {
    console.log("📧 Attempting Resend email to:", studentData.email);
    console.log("🔑 API Key available:", !!process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Simplifying Endo <onboarding@resend.dev>",
      to: studentData.email,
      subject: "🎉 Simplifying Endo Registration Successful",
      html: `
        <div>
          <h1>Simplifying Endo</h1>
          <h2>Dear ${studentData.name},</h2>
          <p>Thank you for registering!</p>
          <p>We will contact you within 24-48 hours.</p>
        </div>
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

module.exports = { sendRegistrationEmail, sendAdminNotification };
