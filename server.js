import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({origin: "https://taar0kh.github.io"}));
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const SYSTEM_PROMPT = `You are an analytical engine evaluating real-time Persian Gulf infrastructure stress conditions.`;

app.post("/evaluate", async (req, res) => {
  try {
    const situation = req.body.situation || "No description provided";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: situation }
      ]
    });

    const json = JSON.parse(completion.choices[0].message.content);
    res.json(json);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

app.get("/healthz", (req, res) => res.send("OK"));

app.get("/prompt/gulf", (req, res) => {
  res.json({
    prompt: `... your full prompt ...`
  });
});

app.listen(3000, () => console.log("Backend running"));
