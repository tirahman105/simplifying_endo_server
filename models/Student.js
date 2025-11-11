const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    address: String,
    dentalCollege: { type: String, required: true },
    session: { type: String, required: true },
    passingYear: { type: String, required: true },
    bmdc: { type: String, required: true },
    practicePlace: String,
    totalPayable: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Assigned"],
    },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    paymentHistory: [
      {
        method: String,
        amount: Number,
        transactionId: String,
        note: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-calculate due amount
studentSchema.pre("save", function (next) {
  this.due = this.totalPayable - this.totalPaid;
  next();
});

module.exports = mongoose.model("Student", studentSchema);
