import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { title, description, objectives } = await req.json();

    if (!title || !Array.isArray(objectives) || objectives.length === 0) {
      return Response.json(
        { error: "title y objectives[] son requeridos" },
        { status: 400 }
      );
    }

    const system = [
      "Eres un tutor técnico claro y conciso.",
      "Escribe una explicación didáctica LARGA en Markdown sobre el subtema dado.",
      "Estructura obligatoria:",
      "  # {title}",
      "  Introducción (3-5 líneas)",
      "  ## Conceptos clave (bullets)",
      "  ## Paso a paso (numerado, práctico)",
      "  ## Ejemplo(s) de código breves cuando aplique",
      "  ## Buenas prácticas y errores comunes",
      "Usa lenguaje simple, sin relleno, y conecta con los objetivos.",
    ].join("\n");

    const user = JSON.stringify({ title, description, objectives });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1200, // ajusta según tu límite
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content:
            "Genera la explicación en Markdown siguiendo la estructura. Datos del subtema: " +
            user,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return Response.json({ error: "Respuesta vacía del modelo" }, { status: 502 });
    }

    return Response.json(
      { title, markdown: content },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return Response.json(
      { error: "Tutor failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}
