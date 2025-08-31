const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Recipients
const RECIPIENTS = ["safvantp39@gmail.com", "safvantp19@gmail.com"];

// Get current IST date
function todayIST() {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const yyyy = ist.getFullYear();
  const mm = String(ist.getMonth() + 1).padStart(2, "0");
  const dd = String(ist.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ignore self-signed certificate
  },
});

// API endpoint to send email
app.post("/send-email", async (req, res) => {
  try {
    const { tasks = [], hours = "", body = "" } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ ok: false, error: "tasks must be an array" });
    }

    const date = todayIST();
    const subject = `DSR ${date}`;

    // Format tasks as bullet points
    const tasksText = tasks.map(task => `- ${task}`).join("\n");

    const text = `
Daily Call Report - ${date}

${tasksText}

Total Hours: ${hours}

${body}
    `.trim();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: RECIPIENTS.join(","),
      subject,
      text,
    });

    res.json({ ok: true, messageId: info.messageId, to: RECIPIENTS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DSR Email Server running on port ${PORT}`);
});
