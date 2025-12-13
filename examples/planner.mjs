import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

const system = [
  "Eres un planificador instruccional.",
  "Devuelve SOLO JSON válido con este shape:",
  `{
    "outlineVersion": 1,
    "subtopics": [
      { "title": "string", "description": "string", "objectives": ["string", "..."] }
    ]
  }`,
  "Entre 6 y 10 subtemas. Objetivos observables y concisos."
].join("\n");

const user = JSON.stringify({
  topic: "Crear paginas web con Next.js",
  level: "intermedio",
  prior_knowledge: "react básico"
});

const resp = await client.chat.completions.create({
  model,
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: system },
    { role: "user", content: user }
  ],
  temperature: 0.2,
  max_tokens: 900
});

const content = resp.choices?.[0]?.message?.content ?? "{}";
console.log("RAW:", content);
console.log("PARSED:", JSON.stringify(JSON.parse(content), null, 2));
