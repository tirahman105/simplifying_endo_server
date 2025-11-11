// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const AdminSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     default: "admin",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Password hash করার middleware
// AdminSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// // Password compare করার method
// AdminSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model("Admin", AdminSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: "super-admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update profile method
adminSchema.methods.updateProfile = async function (updates) {
  const allowedUpdates = ["name", "email", "password"];
  const updatesToApply = {};

  Object.keys(updates).forEach((key) => {
    if (allowedUpdates.includes(key) && updates[key] !== undefined) {
      updatesToApply[key] = updates[key];
    }
  });

  Object.assign(this, updatesToApply);
  return await this.save();
};

module.exports = mongoose.model("Admin", adminSchema);
