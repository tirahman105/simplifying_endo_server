const express = require("express");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const router = express.Router();

// Create new batch
router.post("/", async (req, res) => {
  try {
    const { name, instructor, startDate, endDate, maxSeats } = req.body;

    const batch = new Batch({
      name,
      instructor,
      startDate,
      endDate,
      maxSeats: maxSeats || 20,
    });

    await batch.save();

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Get all batches
router.get("/", async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("students", "name email mobile status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: batches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Get single batch details
router.get("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate(
      "students",
      "name email mobile dentalCollege status"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.json({
      success: true,
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Assign student to batch
router.post("/:id/assign-student", async (req, res) => {
  try {
    const { studentId } = req.body;
    const batch = await Batch.findById(req.params.id);
    const student = await Student.findById(studentId);

    if (!batch || !student) {
      return res.status(404).json({
        success: false,
        message: "Batch or student not found",
      });
    }

    // Check if batch has available seats
    if (batch.students.length >= batch.maxSeats) {
      return res.status(400).json({
        success: false,
        message: "Batch is full",
      });
    }

    // Check if student is already in this batch
    if (batch.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is already in this batch",
      });
    }

    // Remove student from previous batch if any
    if (student.batch) {
      const previousBatch = await Batch.findById(student.batch);
      if (previousBatch) {
        previousBatch.students = previousBatch.students.filter(
          (id) => id.toString() !== studentId
        );
        await previousBatch.save();
      }
    }

    // Add student to batch
    batch.students.push(studentId);
    await batch.save();

    // Update student batch and status
    student.batch = batch._id;
    student.status = "Assigned";
    await student.save();

    res.json({
      success: true,
      message: "Student assigned to batch successfully",
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Remove student from batch
router.delete("/:id/remove-student/:studentId", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    const student = await Student.findById(req.params.studentId);

    if (!batch || !student) {
      return res.status(404).json({
        success: false,
        message: "Batch or student not found",
      });
    }

    // Remove student from batch
    batch.students = batch.students.filter(
      (id) => id.toString() !== req.params.studentId
    );
    await batch.save();

    // Update student
    student.batch = null;
    student.status = "Pending";
    await student.save();

    res.json({
      success: true,
      message: "Student removed from batch successfully",
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Delete batch
router.delete("/:id", async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Remove batch reference from students
    await Student.updateMany(
      { batch: batch._id },
      { $set: { batch: null, status: "Pending" } }
    );

    await Batch.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Batch deleted successfully",
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
