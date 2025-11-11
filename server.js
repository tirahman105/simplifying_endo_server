// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const helmet = require("helmet");
// const jwt = require("jsonwebtoken"); //
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(helmet());
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//   })
// );
// app.use(express.json());

// // Model Imports
// const Student = require("./models/Student");
// const Batch = require("./models/Batch");

// // Test route
// app.get("/api/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "Backend API is working! 🚀",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Fix database inconsistency - TEMPORARY ROUTE
// app.post("/api/fix-database", async (req, res) => {
//   try {
//     console.log("🔧 Fixing database inconsistencies...");

//     // Get all batches and students
//     const batches = await Batch.find();
//     const students = await Student.find();

//     let fixedCount = 0;

//     // Fix each batch
//     for (const batch of batches) {
//       for (const studentId of batch.students) {
//         const student = await Student.findById(studentId);
//         if (student) {
//           // Ensure student has this batch in their batches array
//           if (!student.batches.includes(batch._id)) {
//             console.log(`🔄 Adding batch ${batch._id} to student ${studentId}`);
//             student.batches.push(batch._id);
//             await student.save();
//             fixedCount++;
//           }
//         }
//       }
//     }

//     console.log(`✅ Fixed ${fixedCount} inconsistencies`);

//     res.json({
//       success: true,
//       message: `Database fixed successfully. Fixed ${fixedCount} inconsistencies.`,
//       fixedCount: fixedCount,
//     });
//   } catch (error) {
//     console.error("❌ Fix database error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fixing database",
//       error: error.message,
//     });
//   }
// });

// // ========== BATCH ROUTES ==========

// // Create new batch
// app.post("/api/batches", async (req, res) => {
//   try {
//     const { name, instructor, startDate, endDate, maxSeats } = req.body;

//     console.log("📦 Creating new batch:", { name, instructor });

//     // Basic validation
//     if (!name || !instructor || !startDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Batch name, instructor, and start date are required",
//       });
//     }

//     const batch = new Batch({
//       name,
//       instructor,
//       startDate,
//       endDate,
//       maxSeats: maxSeats || 20,
//     });

//     await batch.save();

//     console.log("✅ Batch created successfully:", batch.name);

//     res.status(201).json({
//       success: true,
//       message: "Batch created successfully",
//       data: batch,
//     });
//   } catch (error) {
//     console.error("❌ Batch creation error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error while creating batch",
//       error: error.message,
//     });
//   }
// });

// // Get all batches
// app.get("/api/batches", async (req, res) => {
//   try {
//     console.log("📋 Fetching batches from database...");

//     const batches = await Batch.find().populate(
//       "students",
//       "name email mobile dentalCollege"
//     );

//     console.log(`✅ Found ${batches.length} batches`);

//     res.json({
//       success: true,
//       data: batches,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching batches:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching batches",
//       error: error.message,
//     });
//   }
// });

// // Get single batch details
// app.get("/api/batches/:id", async (req, res) => {
//   try {
//     console.log("📋 Fetching batch details for ID:", req.params.id);

//     const batch = await Batch.findById(req.params.id).populate(
//       "students",
//       "name email mobile dentalCollege totalPayable totalPaid due"
//     );

//     if (!batch) {
//       return res.status(404).json({
//         success: false,
//         message: "Batch not found",
//       });
//     }

//     console.log("✅ Batch details found:", batch.name);

//     res.json({
//       success: true,
//       data: batch,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching batch details:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid batch ID format",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching batch details",
//       error: error.message,
//     });
//   }
// });

// // Delete batch
// app.delete("/api/batches/:id", async (req, res) => {
//   try {
//     const batch = await Batch.findByIdAndDelete(req.params.id);

//     if (!batch) {
//       return res.status(404).json({
//         success: false,
//         message: "Batch not found",
//       });
//     }

//     // Remove batch reference from students
//     await Student.updateMany(
//       { batches: req.params.id },
//       { $pull: { batches: req.params.id } }
//     );

//     res.json({
//       success: true,
//       message: "Batch deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Batch deletion error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error while deleting batch",
//       error: error.message,
//     });
//   }
// });

// // Assign student to batch - UPDATED FOR MULTIPLE BATCHES
// app.post("/api/batches/:batchId/assign-student", async (req, res) => {
//   try {
//     const { batchId } = req.params;
//     const { studentId } = req.body;

//     console.log(`🎯 Assigning student ${studentId} to batch ${batchId}`);

//     const batch = await Batch.findById(batchId);
//     const student = await Student.findById(studentId);

//     if (!batch) {
//       return res.status(404).json({
//         success: false,
//         message: "Batch not found",
//       });
//     }

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     // Check if batch has available seats
//     if (batch.students.length >= batch.maxSeats) {
//       return res.status(400).json({
//         success: false,
//         message: "Batch is full. No available seats.",
//       });
//     }

//     // Check if student already in this specific batch
//     if (batch.students.includes(studentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Student is already in this batch",
//       });
//     }

//     // Check if student already has this batch in their batches array
//     if (student.batches.includes(batchId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Student is already assigned to this batch",
//       });
//     }

//     // Add student to batch
//     batch.students.push(studentId);
//     await batch.save();

//     // Add batch to student's batches array
//     student.batches.push(batchId);

//     // Update student status if this is their first batch
//     if (student.batches.length === 1) {
//       student.status = "Assigned";
//     }

//     await student.save();

//     // Populate the updated batch and student
//     await batch.populate("students", "name email mobile dentalCollege");
//     await student.populate("batches", "name instructor startDate");

//     res.json({
//       success: true,
//       message: "Student assigned to batch successfully",
//       data: {
//         batch: batch,
//         student: student,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Assign student error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error while assigning student to batch",
//       error: error.message,
//     });
//   }
// });

// // Remove student from batch - UPDATED FOR MULTIPLE BATCHES
// app.delete(
//   "/api/batches/:batchId/remove-student/:studentId",
//   async (req, res) => {
//     try {
//       const { batchId, studentId } = req.params;

//       console.log(`🗑️ Removing student ${studentId} from batch ${batchId}`);

//       const batch = await Batch.findById(batchId);
//       const student = await Student.findById(studentId);

//       if (!batch) {
//         return res.status(404).json({
//           success: false,
//           message: "Batch not found",
//         });
//       }

//       if (!student) {
//         return res.status(404).json({
//           success: false,
//           message: "Student not found",
//         });
//       }

//       // Remove student from batch
//       batch.students = batch.students.filter(
//         (id) => id.toString() !== studentId
//       );
//       await batch.save();

//       // Remove batch reference from student
//       student.batches = student.batches.filter(
//         (id) => id.toString() !== batchId
//       );

//       // Update student status if no batches left
//       if (student.batches.length === 0) {
//         student.status = "Pending";
//       }

//       await student.save();

//       // Populate the updated batch
//       await batch.populate("students", "name email mobile dentalCollege");

//       res.json({
//         success: true,
//         message: "Student removed from batch successfully",
//         data: batch,
//       });
//     } catch (error) {
//       console.error("❌ Remove student error:", error);

//       res.status(500).json({
//         success: false,
//         message: "Server error while removing student from batch",
//         error: error.message,
//       });
//     }
//   }
// );

// // Get student's batches
// app.get("/api/students/:id/batches", async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id).populate(
//       "batches",
//       "name instructor startDate endDate"
//     );

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: student.batches,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching student batches:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching student batches",
//       error: error.message,
//     });
//   }
// });

// // ========== STUDENT ROUTES ==========

// // Get all students - UPDATED
// app.get("/api/students", async (req, res) => {
//   try {
//     console.log("📋 Fetching students from database...");

//     const students = await Student.find()
//       .populate("batches", "name instructor startDate") // Updated to batches
//       .sort({ createdAt: -1 });

//     console.log(`✅ Found ${students.length} students`);

//     res.json({
//       success: true,
//       data: students,
//     });
//   } catch (error) {
//     console.error("❌ Database error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Database error",
//       error: error.message,
//     });
//   }
// });

// // Get single student details - UPDATED
// app.get("/api/students/:id", async (req, res) => {
//   try {
//     console.log("📋 Fetching student details for ID:", req.params.id);

//     const student = await Student.findById(req.params.id).populate(
//       "batches",
//       "name instructor startDate endDate"
//     );

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     console.log("✅ Student details found:", student.name);

//     res.json({
//       success: true,
//       data: student,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching student details:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid student ID format",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching student details",
//       error: error.message,
//     });
//   }
// });

// // Update student status
// app.put("/api/students/:id/status", async (req, res) => {
//   try {
//     const { status } = req.body;
//     const student = await Student.findById(req.params.id);

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     student.status = status;
//     await student.save();

//     res.json({
//       success: true,
//       message: "Student status updated successfully",
//       data: student,
//     });
//   } catch (error) {
//     console.error("❌ Update student status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating student status",
//       error: error.message,
//     });
//   }
// });

// // Add payment to student
// app.post("/api/students/:id/payments", async (req, res) => {
//   try {
//     const { method, amount, transactionId, note, paymentDate } = req.body;
//     const student = await Student.findById(req.params.id);

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     // Create payment object
//     const payment = {
//       method,
//       amount: parseFloat(amount),
//       transactionId,
//       note,
//       date: paymentDate ? new Date(paymentDate) : new Date(),
//     };

//     // Add payment to history
//     student.paymentHistory.push(payment);

//     // Update total paid and due
//     student.totalPaid += parseFloat(amount);
//     student.totalPayable = student.totalPayable || 0;
//     student.due = student.totalPayable - student.totalPaid;

//     await student.save();

//     res.json({
//       success: true,
//       message: "Payment added successfully",
//       data: {
//         payment,
//         totalPayable: student.totalPayable,
//         totalPaid: student.totalPaid,
//         due: student.due,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Payment error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while processing payment",
//       error: error.message,
//     });
//   }
// });

// // Update total payable amount
// app.put("/api/students/:id/total-payable", async (req, res) => {
//   try {
//     const { totalPayable } = req.body;
//     const student = await Student.findById(req.params.id);

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     student.totalPayable = parseFloat(totalPayable);
//     student.due = student.totalPayable - student.totalPaid;

//     await student.save();

//     res.json({
//       success: true,
//       message: "Total payable amount updated successfully",
//       data: student,
//     });
//   } catch (error) {
//     console.error("❌ Update total payable error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating total payable",
//       error: error.message,
//     });
//   }
// });

// // Student registration - UPDATED
// app.post("/api/students/register", async (req, res) => {
//   try {
//     console.log("📝 Registration attempt:", req.body);

//     const {
//       name,
//       email,
//       mobile,
//       address,
//       dentalCollege,
//       session,
//       passingYear,
//       bmdc,
//       practicePlace,
//       batchId,
//     } = req.body;

//     // Basic validation
//     if (
//       !name ||
//       !email ||
//       !mobile ||
//       !dentalCollege ||
//       !session ||
//       !passingYear ||
//       !bmdc
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be filled",
//       });
//     }

//     // Check if student already exists
//     const existingStudent = await Student.findOne({ email });
//     if (existingStudent) {
//       return res.status(400).json({
//         success: false,
//         message: "Student with this email already exists",
//       });
//     }

//     const student = new Student({
//       name,
//       email,
//       mobile,
//       address: address || "",
//       dentalCollege,
//       session,
//       passingYear,
//       bmdc,
//       practicePlace: practicePlace || "",
//       totalPayable: 0,
//       totalPaid: 0,
//       due: 0,
//       batches: batchId ? [batchId] : [], // Updated to batches array
//       status: batchId ? "Assigned" : "Pending",
//     });

//     await student.save();
//     console.log("✅ Student saved to database:", student.email);

//     // If batchId provided, add student to batch
//     if (batchId) {
//       await Batch.findByIdAndUpdate(batchId, {
//         $push: { students: student._id },
//       });
//       console.log(`✅ Student added to batch: ${batchId}`);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Registration successful! We will contact you soon.",
//       data: student,
//     });
//   } catch (error) {
//     console.error("❌ Registration error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during registration",
//       error: error.message,
//     });
//   }
// });

// // Update student information
// app.put("/api/students/:id", async (req, res) => {
//   try {
//     const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Student updated successfully",
//       data: student,
//     });
//   } catch (error) {
//     console.error("❌ Update student error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while updating student",
//       error: error.message,
//     });
//   }
// });

// // Delete student
// app.delete("/api/students/:id", async (req, res) => {
//   try {
//     const student = await Student.findByIdAndDelete(req.params.id);

//     if (!student) {
//       return res.status(404).json({
//         success: false,
//         message: "Student not found",
//       });
//     }

//     // Remove student from any batches
//     await Batch.updateMany(
//       { students: req.params.id },
//       { $pull: { students: req.params.id } }
//     );

//     res.json({
//       success: true,
//       message: "Student deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Delete student error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while deleting student",
//       error: error.message,
//     });
//   }
// });

// // ========== AUTH ROUTES ==========

// // Admin login (simplified)
// app.post("/api/auth/admin/login", (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("🔐 Admin login attempt:", email);

//     // Demo login - always success for now
//     const token = "demo_jwt_token_" + Date.now();

//     res.json({
//       success: true,
//       message: "Login successful",
//       token: token,
//       admin: {
//         id: "admin_1",
//         name: "Super Admin",
//         email: "admin@dental.com",
//         role: "admin",
//       },
//     });
//   } catch (error) {
//     console.error("❌ Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// });

// // ========== DASHBOARD ROUTES ==========

// // Dashboard statistics
// app.get("/api/dashboard/stats", async (req, res) => {
//   try {
//     const totalStudents = await Student.countDocuments();
//     const totalBatches = await Batch.countDocuments();
//     const totalRevenue = await Student.aggregate([
//       {
//         $group: {
//           _id: null,
//           total: { $sum: "$totalPaid" },
//         },
//       },
//     ]);

//     const recentStudents = await Student.find()
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("name email createdAt");

//     const stats = {
//       totalStudents,
//       totalBatches,
//       totalRevenue: totalRevenue[0]?.total || 0,
//       recentStudents,
//     };

//     res.json({
//       success: true,
//       data: stats,
//     });
//   } catch (error) {
//     console.error("❌ Dashboard stats error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching dashboard stats",
//       error: error.message,
//     });
//   }
// });

// // MongoDB Connection
// console.log("🔗 Attempting MongoDB connection...");

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("✅ MongoDB Connected Successfully!");
//   })
//   .catch((err) => {
//     console.log("❌ MongoDB Connection Failed:", err.message);
//   });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Backend Server running on port ${PORT}`);
//   console.log(`📱 API URL: http://localhost:${PORT}`);
//   console.log(`🎯 Available endpoints:`);
//   console.log(`   GET  /api/batches`);
//   console.log(`   GET  /api/batches/:id`);
//   console.log(`   POST /api/batches`);
//   console.log(`   DEL  /api/batches/:id`);
//   console.log(`   POST /api/batches/:batchId/assign-student`);
//   console.log(`   DEL  /api/batches/:batchId/remove-student/:studentId`);
// });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  sendRegistrationEmail,
  sendAdminNotification,
} = require("./utils/emailService");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://drrazib.netlify.app",
      "https://www.drrazib.com", // যদি custom domain থাকে
      "https://drrazib.com", // যদি custom domain থাকে
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());

// Model Imports
const Student = require("./models/Student");
const Batch = require("./models/Batch");
const Admin = require("./models/Admin");

// Auth Middleware import
const authMiddleware = require("./middleware/auth");

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend API is working! 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ========== ADMIN SETUP & AUTH ROUTES ==========

// First time admin setup (একবার মাত্র কল করুন)
app.post("/api/setup-admin", async (req, res) => {
  try {
    console.log("🔧 Setting up default admin...");

    const adminCount = await Admin.countDocuments();

    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const admin = new Admin({
      name: "Super Admin",
      email: "admin@dental.com",
      password: "admin123",
    });

    await admin.save();

    console.log("✅ Default admin created successfully");

    res.status(201).json({
      success: true,
      message:
        "Default admin created successfully. Please change password after first login.",
      credentials: {
        email: "admin@dental.com",
        password: "admin123",
      },
    });
  } catch (error) {
    console.error("❌ Setup admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin setup",
      error: error.message,
    });
  }
});

// Admin login (Real authentication)
app.post("/api/auth/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Admin login attempt:", email);

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET || "dental_admin_secret_2024",
      { expiresIn: "7d" }
    );

    console.log("✅ Admin login successful:", admin.email);

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Change admin password
app.put("/api/auth/admin/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
      error: error.message,
    });
  }
});

// ========== ADMIN PROFILE MANAGEMENT ROUTES ==========

// Get admin profile (Protected)
app.get("/api/auth/admin/profile", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("❌ Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admin profile",
      error: error.message,
    });
  }
});

// Update admin profile (email, name, password) - Protected
app.put("/api/auth/admin/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const updates = {};

    // Update name if provided
    if (name) {
      updates.name = name;
    }

    // Update email if provided
    if (email && email !== admin.email) {
      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      updates.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set new password",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      updates.password = newPassword;
    }

    // Apply updates
    Object.assign(admin, updates);
    await admin.save();

    // Get updated admin without password
    const updatedAdmin = await Admin.findById(req.admin.id).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("❌ Update admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: error.message,
    });
  }
});

// Simple update admin profile (without password verification for email/name)
app.patch(
  "/api/auth/admin/profile-simple",
  authMiddleware,
  async (req, res) => {
    try {
      const { name, email } = req.body;
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      // Update name if provided
      if (name) {
        admin.name = name;
      }

      // Update email if provided
      if (email && email !== admin.email) {
        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
        admin.email = email;
      }

      await admin.save();

      // Get updated admin without password
      const updatedAdmin = await Admin.findById(req.admin.id).select(
        "-password"
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedAdmin,
      });
    } catch (error) {
      console.error("❌ Simple update admin profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating profile",
        error: error.message,
      });
    }
  }
);

// ========== PROTECTED ADMIN ROUTES ==========

// Protected dashboard stats
app.get("/api/admin/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    console.log("📊 Admin accessing dashboard:", req.admin.email);

    const totalStudents = await Student.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const totalRevenue = await Student.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPaid" },
        },
      },
    ]);

    const pendingStudents = await Student.countDocuments({ status: "Pending" });
    const assignedStudents = await Student.countDocuments({
      status: "Assigned",
    });

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt status")
      .populate("batches", "name");

    const stats = {
      totalStudents,
      totalBatches,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingStudents,
      assignedStudents,
      recentStudents,
    };

    res.json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: stats,
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
      error: error.message,
    });
  }
});

// ========== PUBLIC ROUTES ==========

// Fix database inconsistency - TEMPORARY ROUTE
app.post("/api/fix-database", async (req, res) => {
  try {
    console.log("🔧 Fixing database inconsistencies...");

    // Get all batches and students
    const batches = await Batch.find();
    const students = await Student.find();

    let fixedCount = 0;

    // Fix each batch
    for (const batch of batches) {
      for (const studentId of batch.students) {
        const student = await Student.findById(studentId);
        if (student) {
          // Ensure student has this batch in their batches array
          if (!student.batches.includes(batch._id)) {
            console.log(`🔄 Adding batch ${batch._id} to student ${studentId}`);
            student.batches.push(batch._id);
            await student.save();
            fixedCount++;
          }
        }
      }
    }

    console.log(`✅ Fixed ${fixedCount} inconsistencies`);

    res.json({
      success: true,
      message: `Database fixed successfully. Fixed ${fixedCount} inconsistencies.`,
      fixedCount: fixedCount,
    });
  } catch (error) {
    console.error("❌ Fix database error:", error);
    res.status(500).json({
      success: false,
      message: "Error fixing database",
      error: error.message,
    });
  }
});

// ========== BATCH ROUTES ==========

// Create new batch (Protected)
app.post("/api/batches", authMiddleware, async (req, res) => {
  try {
    const { name, instructor, startDate, endDate, maxSeats } = req.body;

    console.log("📦 Creating new batch:", { name, instructor });

    // Basic validation
    if (!name || !instructor || !startDate) {
      return res.status(400).json({
        success: false,
        message: "Batch name, instructor, and start date are required",
      });
    }

    const batch = new Batch({
      name,
      instructor,
      startDate,
      endDate,
      maxSeats: maxSeats || 20,
    });

    await batch.save();

    console.log("✅ Batch created successfully:", batch.name);

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    console.error("❌ Batch creation error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating batch",
      error: error.message,
    });
  }
});

// Get all batches (Public)
app.get("/api/batches", async (req, res) => {
  try {
    console.log("📋 Fetching batches from database...");

    const batches = await Batch.find().populate(
      "students",
      "name email mobile dentalCollege status"
    );

    console.log(`✅ Found ${batches.length} batches`);

    res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    console.error("❌ Error fetching batches:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching batches",
      error: error.message,
    });
  }
});

// Get single batch details (Public)
app.get("/api/batches/:id", async (req, res) => {
  try {
    console.log("📋 Fetching batch details for ID:", req.params.id);

    const batch = await Batch.findById(req.params.id).populate(
      "students",
      "name email mobile dentalCollege totalPayable totalPaid due status"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    console.log("✅ Batch details found:", batch.name);

    res.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error("❌ Error fetching batch details:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching batch details",
      error: error.message,
    });
  }
});

// Delete batch (Protected)
app.delete("/api/batches/:id", authMiddleware, async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Remove batch reference from students
    await Student.updateMany(
      { batches: req.params.id },
      { $pull: { batches: req.params.id } }
    );

    res.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("❌ Batch deletion error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting batch",
      error: error.message,
    });
  }
});

// Assign student to batch (Protected)
app.post(
  "/api/batches/:batchId/assign-student",
  authMiddleware,
  async (req, res) => {
    try {
      const { batchId } = req.params;
      const { studentId } = req.body;

      console.log(`🎯 Assigning student ${studentId} to batch ${batchId}`);

      const batch = await Batch.findById(batchId);
      const student = await Student.findById(studentId);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Check if batch has available seats
      if (batch.students.length >= batch.maxSeats) {
        return res.status(400).json({
          success: false,
          message: "Batch is full. No available seats.",
        });
      }

      // Check if student already in this specific batch
      if (batch.students.includes(studentId)) {
        return res.status(400).json({
          success: false,
          message: "Student is already in this batch",
        });
      }

      // Check if student already has this batch in their batches array
      if (student.batches.includes(batchId)) {
        return res.status(400).json({
          success: false,
          message: "Student is already assigned to this batch",
        });
      }

      // Add student to batch
      batch.students.push(studentId);
      await batch.save();

      // Add batch to student's batches array
      student.batches.push(batchId);

      // Update student status if this is their first batch
      if (student.batches.length === 1) {
        student.status = "Assigned";
      }

      await student.save();

      // Populate the updated batch and student
      await batch.populate(
        "students",
        "name email mobile dentalCollege status"
      );
      await student.populate("batches", "name instructor startDate");

      res.json({
        success: true,
        message: "Student assigned to batch successfully",
        data: {
          batch: batch,
          student: student,
        },
      });
    } catch (error) {
      console.error("❌ Assign student error:", error);

      res.status(500).json({
        success: false,
        message: "Server error while assigning student to batch",
        error: error.message,
      });
    }
  }
);

// Remove student from batch (Protected)
app.delete(
  "/api/batches/:batchId/remove-student/:studentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { batchId, studentId } = req.params;

      console.log(`🗑️ Removing student ${studentId} from batch ${batchId}`);

      const batch = await Batch.findById(batchId);
      const student = await Student.findById(studentId);

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Remove student from batch
      batch.students = batch.students.filter(
        (id) => id.toString() !== studentId
      );
      await batch.save();

      // Remove batch reference from student
      student.batches = student.batches.filter(
        (id) => id.toString() !== batchId
      );

      // Update student status if no batches left
      if (student.batches.length === 0) {
        student.status = "Pending";
      }

      await student.save();

      // Populate the updated batch
      await batch.populate(
        "students",
        "name email mobile dentalCollege status"
      );

      res.json({
        success: true,
        message: "Student removed from batch successfully",
        data: batch,
      });
    } catch (error) {
      console.error("❌ Remove student error:", error);

      res.status(500).json({
        success: false,
        message: "Server error while removing student from batch",
        error: error.message,
      });
    }
  }
);

// Get student's batches (Public)
app.get("/api/students/:id/batches", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "batches",
      "name instructor startDate endDate"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student.batches,
    });
  } catch (error) {
    console.error("❌ Error fetching student batches:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching student batches",
      error: error.message,
    });
  }
});

// ========== STUDENT ROUTES ==========

// Get all students (Protected)
app.get("/api/students", authMiddleware, async (req, res) => {
  try {
    console.log("📋 Fetching students from database...");

    const students = await Student.find()
      .populate("batches", "name instructor startDate")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${students.length} students`);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("❌ Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
});

// Get single student details (Protected)
app.get("/api/students/:id", authMiddleware, async (req, res) => {
  try {
    console.log("📋 Fetching student details for ID:", req.params.id);

    const student = await Student.findById(req.params.id).populate(
      "batches",
      "name instructor startDate endDate"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log("✅ Student details found:", student.name);

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("❌ Error fetching student details:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching student details",
      error: error.message,
    });
  }
});

// Update student status (Protected)
app.put("/api/students/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.status = status;
    await student.save();

    res.json({
      success: true,
      message: "Student status updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("❌ Update student status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating student status",
      error: error.message,
    });
  }
});

// Add payment to student (Protected)
app.post("/api/students/:id/payments", authMiddleware, async (req, res) => {
  try {
    const { method, amount, transactionId, note, paymentDate } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Create payment object
    const payment = {
      method,
      amount: parseFloat(amount),
      transactionId,
      note,
      date: paymentDate ? new Date(paymentDate) : new Date(),
    };

    // Add payment to history
    student.paymentHistory.push(payment);

    // Update total paid and due
    student.totalPaid += parseFloat(amount);
    student.totalPayable = student.totalPayable || 0;
    student.due = student.totalPayable - student.totalPaid;

    await student.save();

    res.json({
      success: true,
      message: "Payment added successfully",
      data: {
        payment,
        totalPayable: student.totalPayable,
        totalPaid: student.totalPaid,
        due: student.due,
      },
    });
  } catch (error) {
    console.error("❌ Payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing payment",
      error: error.message,
    });
  }
});

// Update total payable amount (Protected)
app.put("/api/students/:id/total-payable", authMiddleware, async (req, res) => {
  try {
    const { totalPayable } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    student.totalPayable = parseFloat(totalPayable);
    student.due = student.totalPayable - student.totalPaid;

    await student.save();

    res.json({
      success: true,
      message: "Total payable amount updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("❌ Update total payable error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating total payable",
      error: error.message,
    });
  }
});

// Student registration (Public)
// app.post("/api/students/register", async (req, res) => {
//   try {
//     console.log("📝 Registration attempt:", req.body);

//     const {
//       name,
//       email,
//       mobile,
//       address,
//       dentalCollege,
//       session,
//       passingYear,
//       bmdc,
//       practicePlace,
//       batchId,
//     } = req.body;

//     // Basic validation
//     if (
//       !name ||
//       !email ||
//       !mobile ||
//       !dentalCollege ||
//       !session ||
//       !passingYear ||
//       !bmdc
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be filled",
//       });
//     }

//     // Check if student already exists
//     const existingStudent = await Student.findOne({ email });
//     if (existingStudent) {
//       return res.status(400).json({
//         success: false,
//         message: "Student with this email already exists",
//       });
//     }

//     const student = new Student({
//       name,
//       email,
//       mobile,
//       address: address || "",
//       dentalCollege,
//       session,
//       passingYear,
//       bmdc,
//       practicePlace: practicePlace || "",
//       totalPayable: 0,
//       totalPaid: 0,
//       due: 0,
//       batches: batchId ? [batchId] : [],
//       status: batchId ? "Assigned" : "Pending",
//     });

//     await student.save();
//     console.log("✅ Student saved to database:", student.email);

//     // If batchId provided, add student to batch
//     if (batchId) {
//       await Batch.findByIdAndUpdate(batchId, {
//         $push: { students: student._id },
//       });
//       console.log(`✅ Student added to batch: ${batchId}`);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Registration successful! We will contact you soon.",
//       data: student,
//     });
//   } catch (error) {
//     console.error("❌ Registration error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during registration",
//       error: error.message,
//     });
//   }
// });

// Student registration (Public)
// Student registration (Public)
app.post("/api/students/register", async (req, res) => {
  try {
    console.log("📝 Registration attempt:", req.body);

    const {
      name,
      email,
      mobile,
      address,
      dentalCollege,
      session,
      passingYear,
      bmdc,
      practicePlace,
      batchId,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !email ||
      !mobile ||
      !dentalCollege ||
      !session ||
      !passingYear ||
      !bmdc
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists",
      });
    }

    const student = new Student({
      name,
      email,
      mobile,
      address: address || "",
      dentalCollege,
      session,
      passingYear,
      bmdc,
      practicePlace: practicePlace || "",
      totalPayable: 0,
      totalPaid: 0,
      due: 0,
      batches: batchId ? [batchId] : [],
      status: batchId ? "Assigned" : "Pending",
    });

    await student.save();
    console.log("✅ Student saved to database:", student.email);

    // ✅ Send confirmation email to student (ASYNC - don't wait for it)
    sendRegistrationEmail({
      name,
      email,
      mobile,
      dentalCollege,
      session,
      bmdc,
    })
      .then(() => console.log("✅ Confirmation email sent to student"))
      .catch((emailError) =>
        console.error(
          "❌ Email sending failed, but student saved:",
          emailError.message
        )
      );

    // ✅ Send notification to admin (ASYNC - don't wait for it)
    sendAdminNotification({
      name,
      email,
      mobile,
      dentalCollege,
      bmdc,
    })
      .then(() => console.log("✅ Admin notification sent"))
      .catch((adminEmailError) =>
        console.error("❌ Admin email failed:", adminEmailError.message)
      );

    // If batchId provided, add student to batch
    if (batchId) {
      await Batch.findByIdAndUpdate(batchId, {
        $push: { students: student._id },
      });
      console.log(`✅ Student added to batch: ${batchId}`);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Confirmation email sent.",
      data: student,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
});

// Update student information - COMPLETE UPDATE (NEW ROUTE)
app.put("/api/students/:id", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      address,
      dentalCollege,
      session,
      passingYear,
      bmdc,
      practicePlace,
      status,
    } = req.body;

    console.log("🔄 Updating student:", req.params.id);

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.mobile = mobile || student.mobile;
    student.address = address || student.address;
    student.dentalCollege = dentalCollege || student.dentalCollege;
    student.session = session || student.session;
    student.passingYear = passingYear || student.passingYear;
    student.bmdc = bmdc || student.bmdc;
    student.practicePlace = practicePlace || student.practicePlace;
    if (status) student.status = status;

    await student.save();

    // Populate batches before sending response
    await student.populate("batches", "name instructor startDate");

    console.log("✅ Student updated successfully:", student.email);

    res.json({
      success: true,
      message: "Student information updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("❌ Update student error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating student",
      error: error.message,
    });
  }
});

// Delete student (Protected)
app.delete("/api/students/:id", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Remove student from any batches
    await Batch.updateMany(
      { students: req.params.id },
      { $pull: { students: req.params.id } }
    );

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting student",
      error: error.message,
    });
  }
});

// ========== DASHBOARD ROUTES ==========

// Public dashboard statistics (for website)
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const totalRevenue = await Student.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPaid" },
        },
      },
    ]);

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    const stats = {
      totalStudents,
      totalBatches,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentStudents,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats",
      error: error.message,
    });
  }
});

// ========== ERROR HANDLING ==========

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("🚨 Global Error Handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// MongoDB Connection
console.log("🔗 Attempting MongoDB connection...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed:", err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on port ${PORT}`);
  console.log(`📱 API URL: http://localhost:${PORT}`);
  // console.log(`🎯 Available endpoints:`);
  // console.log(`   POST /api/setup-admin (একবার মাত্র)`);
  // console.log(`   POST /api/auth/admin/login`);
  // console.log(`   GET  /api/admin/dashboard/stats (Protected)`);
  // console.log(`   GET  /api/batches`);
  // console.log(`   POST /api/batches (Protected)`);
  // console.log(`   GET  /api/students (Protected)`);
  // console.log(`   POST /api/students/register (Public)`);
  // console.log(`=========================================`);
  // console.log(`🔐 Default Admin Credentials after setup:`);
  // console.log(`   Email: admin@dental.com`);
  // console.log(`   Password: admin123`);
});
