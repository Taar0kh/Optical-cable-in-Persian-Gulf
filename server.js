import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({ origin: "https://taar0kh.github.io" }));
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an analytical engine evaluating real-time Persian Gulf infrastructure stress conditions.`,
  generationConfig: {
    temperature: 0.2,
    responseMimeType: "application/json", // Forces JSON output
  },
});

app.post("/evaluate", async (req, res) => {
  try {
    const situation = req.body.situation || "No description provided";

    const result = await model.generateContent(situation);
    const text = result.response.text();
    const json = JSON.parse(text);

    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

app.get("/healthz", (req, res) => res.send("OK"));

app.get("/prompt/gulf", (req, res) => {
  res.json({
    prompt: `... your full prompt ...`,
  });
});

app.listen(3000, () => console.log("Backend running"));
