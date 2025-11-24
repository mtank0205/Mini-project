import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    const prompt = req.body.code;
    console.log("🧠 Hugging Face request:", prompt);

    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const output =
      response.data?.generated_text ||
      response.data[0]?.generated_text ||
      "⚠️ No output received from Hugging Face.";

    res.json({ output });
  } catch (err) {
    console.error("❌ Hugging Face Error:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data?.error || "Hugging Face API failed",
    });
  }
});

export default router;
