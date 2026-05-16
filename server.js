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
    prompt: `Gulf Fiber Cable Disruption — Impact Quantification Prompt

Context
You are a geopolitical risk and critical infrastructure analyst. A conflict in the Persian Gulf has damaged or destroyed the submarine fiber optic cable corridor running through the Gulf, including cables such as SEA-ME-WE 3/4/5/6, FALCON, FLAG, and AAE-1. These cables carry internet and operational technology (OT/SCADA) traffic for the Gulf states (UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman), the Indian subcontinent (India, Pakistan, Bangladesh), and global energy export infrastructure.

The affected region includes:

Gulf states total population: ~60 million
Indian subcontinent west-corridor traffic dependency: ~70% of international bandwidth
SCADA systems for power generation, desalination, LNG liquefaction, and oil export terminals
The GCCIA power grid interconnection across all six Gulf states
Qatar LNG exports (~22% of global LNG trade)
Strait of Hormuz crude oil transit (~21% of globally traded oil)


Task
Given a conflict phase and elapsed time (in hours or days) since the cable was destroyed, calculate the following eight impact values as percentages representing degradation from the normal operating baseline (100% = fully normal; 0% = total failure):


Output Values — Definitions
1. Internet Loss (%)
Percentage of normal internet connectivity lost in the affected region (Gulf states + Indian subcontinent west corridor). Account for satellite and microwave fallback capacity. Express as: percentage of normal bandwidth no longer available.
2. Power Loss (%)
Weighted average percentage of Gulf state power generation capacity unavailable or uncontrollable, due to SCADA communication failure and cascading grid trips. Weight by installed generation capacity: Saudi Arabia (~90 GW), UAE (~35 GW), Qatar (~11 GW), Kuwait (~20 GW), Bahrain (~4 GW), Oman (~8 GW). UAE Barakah nuclear (5.6 GW) operates independently — exclude from loss. Express as: percentage of total weighted Gulf generation capacity impaired.
3. Export Loss (%)
Percentage reduction in Gulf energy export volume versus pre-event baseline. Include: crude oil tanker loading, LNG liquefaction and loading, refined petroleum products, and pipeline gas exports. Weight by global trade significance. Express as: percentage of normal export throughput lost.
4. Global Energy Transmission Disruption (%) — four sub-values
Return separate percentage disruption figures for each commodity:

Crude oil: % of global crude oil trade flow disrupted (baseline: ~21 Mb/day through Strait of Hormuz corridor)
LNG: % of global LNG trade disrupted (baseline: Qatar ~77 Mt/yr = ~22% of global traded LNG)
Refined products: % of global refined product exports disrupted from Gulf refineries
Pipeline gas: % of regional pipeline gas delivery disrupted (Abu Dhabi–Oman pipeline, DOLPHIN gas network UAE–Qatar)
5. Oil Price Spike (%)
Estimated percentage increase in Brent crude spot price above pre-event level, based on the export disruption magnitude, market uncertainty premium, and strategic reserve response timeline. Express as: +X% above pre-event price.
6. Blockchain Failure (%)
Percentage of blockchain-based energy sector operations in the affected region that are non-functional. Scope includes: LNG spot trading platforms (QatarEnergy, ADNOC), tokenized energy asset contracts, smart grid settlement nodes (DEWA blockchain meter network, India Power Ledger deployments), cross-border CBDC energy settlement (mBridge), carbon credit and REC markets. Express as: percentage of blockchain energy operations offline or frozen.
7. Humanitarian Stress (%)
A composite index (0–100%) representing the humanitarian risk level across the Gulf population. Inputs: (a) AC loss exposure given ambient temperature (summer baseline: 45–62°C heat index), (b) water reserve depletion rate given desalination shutdown, (c) hospital diesel reserve status, (d) food cold-chain integrity, (e) civil order indicators. 100% = mass-casualty humanitarian emergency in progress. Express as: percentage of maximum humanitarian stress index reached.


Input Parameters
Provide your answer for the following scenario:

Elapsed time: [INSERT: e.g. "6 hours" / "Day 1" / "Day 3" / "Day 7" / "Week 2"]
Season: [INSERT: "summer" (June–September) or "winter" (December–February)]
Conflict intensity: [INSERT: "localized cable cut" / "sustained Gulf conflict" / "full Strait of Hormuz closure"]
Satellite fallback: [INSERT: "none deployed" / "Starlink partial" / "full LEO constellation"]
Chinese OT systems active: [INSERT: "yes — Huawei 5G + SUPCON deployed" / "no"]


Output Format
Return a structured JSON object followed by a brief (3–5 sentence) narrative summary.

{

  "elapsed_time": "",

  "season": "",

  "conflict_intensity": "",

  "internet_loss_pct": 0,

  "power_loss_pct": 0,

  "export_loss_pct": 0,

  "global_energy_transmission": {

    "crude_oil_pct": 0,

    "lng_pct": 0,

    "refined_products_pct": 0,

    "pipeline_gas_pct": 0

  },

  "oil_price_spike_pct": 0,

  "blockchain_failure_pct": 0,

  "humanitarian_stress_pct": 0,

  "confidence": "low | medium | high",

  "key_assumptions": []

}

Then provide a narrative summary covering: which value is deteriorating fastest, which systems are showing unexpected resilience, and what the single highest-priority intervention would be.


Constraints and Calibration Notes
All percentages are bounded 0–100 except oil_price_spike_pct, which is unbounded upward.
Values should reflect a deterministic worst-case within the given phase, not an average.
If Chinese OT systems (Huawei 5G, SUPCON DCS) are marked active, reduce Power Loss by 10–18% to reflect SCADA continuity on privately networked facilities.
Humanitarian Stress accelerates non-linearly after Hour 6 in summer — apply a 1.5× multiplier to the rate of increase between Hour 6 and Hour 48 versus a winter scenario.
Blockchain Failure front-loads: assume 40–50% offline within the first hour due to node connectivity loss, then degrades more slowly as remaining nodes lose power.
LNG disruption lags crude by approximately 12–18 hours due to process shutdown time, but is harder to reverse — add a 10% floor once disruption exceeds 48 hours.

`,
  });
});

app.listen(3000, () => console.log("Backend running"));
