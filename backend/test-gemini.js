import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    console.log("🔑 Testing API Key:", process.env.GEMINI_API_KEY);
    console.log("📡 Attempting to connect to Gemini...");
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ SUCCESS! Gemini responded:", text);
  } catch (error) {
    console.error("❌ FAILED!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
  }
}

testGemini();
