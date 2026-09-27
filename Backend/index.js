require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
});

// Test database connection
pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("✅ PostgreSQL connected successfully");
    console.log("Database time:", result.rows[0].now);
  })
  .catch((error) => {
    console.error("❌ PostgreSQL connection failed:");
    console.error(error.message);
  });

// Submit form
app.post("/api/submit-data", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    message,
  } = req.body;

  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({
      error: "First name, last name, email and phone are required.",
    });
  }

  try {
    const query = `
      INSERT INTO users
        (first_name, last_name, email, phone, message)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      firstName,
      lastName,
      email,
      phone,
      message || null,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Your enquiry has been submitted successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      error: "Unable to submit your enquiry. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});