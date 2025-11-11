const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

// Add payment to student
router.post("/students/:id/payments", async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Get payment history for a student
router.get("/students/:id/payments", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Sort payment history by date (newest first)
    const sortedPayments = student.paymentHistory.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json({
      success: true,
      data: {
        payments: sortedPayments,
        totalPayable: student.totalPayable,
        totalPaid: student.totalPaid,
        due: student.due,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update total payable amount for student
router.put("/students/:id/total-payable", async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Delete a payment
router.delete("/students/:studentId/payments/:paymentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Find the payment
    const payment = student.paymentHistory.id(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Subtract payment amount from total paid
    student.totalPaid -= payment.amount;
    student.due = student.totalPayable - student.totalPaid;

    // Remove payment from history
    student.paymentHistory.pull({ _id: req.params.paymentId });

    await student.save();

    res.json({
      success: true,
      message: "Payment deleted successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
