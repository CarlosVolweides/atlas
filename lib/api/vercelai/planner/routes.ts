// app/api/plan/route.ts
import { NextRequest } from "next/server";
export const runtime = "nodejs";

const GATEWAY_BASE = process.env.AI_GATEWAY_URL!;
const GATEWAY_KEY  = process.env.AI_GATEWAY_API_KEY!;
const MODEL        = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

export async function POST(req: NextRequest) {
  const { topic, level, priorKnowledge } = await req.json();
  if (!topic || !level) {
    return Response.json({ error: "topic y level son requeridos" }, { status: 400 });
  }

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
    topic,
    level,
    prior_knowledge: priorKnowledge ?? ""
  });

  const res = await fetch(`${GATEWAY_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GATEWAY_KEY}`,
      "Content-Type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.2,
      max_tokens: 600
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return Response.json({ error: "LLM planning failed", detail: text }, { status: 502 });
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    return Response.json({ error: "Respuesta vacía del modelo" }, { status: 502 });
  }

  // Validación básica de JSON
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.subtopics)) throw new Error("subtopics faltante");
    return Response.json(parsed, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return Response.json({ error: "JSON inválido", detail: e?.message ?? String(e), raw: content }, { status: 502 });
  }
}
