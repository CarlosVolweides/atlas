import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { topic, level, priorKnowledge } = await req.json();

    if (!topic || !level) {
      return Response.json({ error: "topic y level son requeridos" }, { status: 400 });
    }

    const system = [
      "Eres un planificador instruccional. Hola mi gente",
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

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.2,
      max_tokens: 900
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "Respuesta vacía del modelo" }, { status: 502 });
    }

    // Validación básica de JSON
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed?.subtopics)) {
      throw new Error("subtopics faltante");
    }

    return Response.json(parsed, {
      status: 200,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    return Response.json(
      { error: "OpenAI planning failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}
