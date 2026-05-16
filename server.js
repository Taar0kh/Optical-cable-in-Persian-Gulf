import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({ origin: "https://taar0kh.github.io" }));
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com"
});

const SYSTEM_PROMPT = `You are an analytical engine evaluating real-time Persian Gulf infrastructure stress conditions.

You must ALWAYS respond with ONLY a valid JSON object — no explanation, no markdown, no backticks.
The JSON must contain exactly these 7 fields:
{
  "internet_loss": <integer 0-100>,
  "power_loss": <integer 0-100>,
  "export_loss": <integer 0-100>,
  "oil_spike": <integer 0-100>,
  "blockchain_failure": <integer 0-100>,
  "humanitarian_stress": <integer 0-100>,
  "economic_loss": <number in billions, e.g. 150>
}`;

app.post("/evaluate", async (req, res) => {
  try {
    const situation = req.body.situation || "No description provided";

    const message = await client.chat.completions.create({
      model: "deepseek-chat",
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: situation }
      ]
    });

    const text = message.choices[0].message.content;
    const json = JSON.parse(text);
    res.json(json);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evaluation failed", details: err.message });
  }
});

app.get("/healthz", (req, res) => res.send("OK"));

app.get("/prompt/gulf", (req, res) => {
  res.json({
    prompt: `Evaluate the following Persian Gulf infrastructure stress scenario and return impact metrics as JSON.

Elapsed time since incident: [INSERT: e.g. "6 hours" / "Day 1" / "Day 3" / "Day 7" / "Week 2"]
Season: [INSERT: "summer" (June-September) or "winter" (December-February)]
Conflict intensity: [INSERT: "localized cable cut" / "sustained Gulf conflict" / "full Strait of Hormuz closure"]
Satellite fallback available: [INSERT: "none deployed" / "Starlink partial" / "full LEO constellation"]
Chinese OT systems active: [INSERT: "yes - Huawei 5G + SUPCON deployed" / "no"]

Context:
- Multiple submarine optical fiber cables severed in the Persian Gulf
- SCADA and OT telemetry over fiber is disrupted
- GCC interconnected power grids at risk of cascading failure
- Desalination plants depend on continuous SCADA synchronization
- LNG export terminals (Qatar, UAE) rely on fiber-based automation
- Strait of Hormuz handles 20-25% of global traded energy

Assess the realistic impact at this point in time and return ONLY a JSON object.`
  });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
