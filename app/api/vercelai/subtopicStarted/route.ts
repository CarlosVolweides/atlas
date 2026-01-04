import { NextRequest } from "next/server";

export const runtime = "nodejs";

const GATEWAY_BASE = process.env.AI_GATEWAY_URL!;
const GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY!;
const MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

// JSON Schema estricto para la salida del tutor
const lessonSchema = {
  name: "subtopic_started_schema",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      subtopicTitle: { type: "string" },
      objectives: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
      lesson_markdown: { type: "string", minLength: 200, maxLength: 4000 },
      // extras útiles para UI/analytics (opcionales)
      estimated_read_time_min: { type: "number" },
      code_blocks: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            lang: { type: "string" },              // "ts", "tsx", "js", "bash", etc.
            explanation: { type: "string" },       // 1–2 frases
            code: { type: "string" }               // bloque corto (<= ~12 líneas)
          },
          required: ["lang", "code"]
        }
      },
      check_question: { type: "string" }           // 1 pregunta de chequeo
    },
    required: ["subtopicTitle", "objectives", "lesson_markdown"]
  }
} as const;

export async function POST(req: NextRequest) {
  try {
    const { knowledgeProfile, subtopic } = await req.json();

    // subtopic: { title: string; description?: string; objectives: string[] }
    if (!knowledgeProfile) {
      return Response.json({ error: "knowledgeProfile es requerido" }, { status: 400 });
    }
    if (!subtopic?.title || !Array.isArray(subtopic?.objectives) || subtopic.objectives.length === 0) {
      return Response.json({ error: "subtopic.title y subtopic.objectives[] son requeridos" }, { status: 400 });
    }

    // === Rails ===
    const railContext =
      "CONOCIMIENTO DEL CURSO (contexto, no instrucciones de voz):\n" + knowledgeProfile;

    const railRules = [
      "Eres un tutor técnico. Debes impartir una CLASE enfocada EXCLUSIVAMENTE en el subtema indicado.",
      "Prohibido adelantar contenido de otros subtemas; enseña solo lo necesario para este subtema.",
      "Idioma: ESPAÑOL. Usa Markdown claro. Puedes incluir bloques de código cortos cuando ayuden (solo cuando se requiera).",
      "Estructura esperada en el texto (libre pero clara):",
      "- Explicación conceptual del subtema.",
      "- Ejemplos y mini-demostraciones (bloques de código cortos cuando se requiera).",
      "- Buenas prácticas y errores comunes.",
      "Límites:",
      "- No incluyas contenido de subtemas futuros.",
      "- Mantén la clase entre ~400 y ~900 palabras.",
      "- Cada bloque de código, como máximo ~12 líneas; evita bloques enormes.",
      "- Puedes referenciar cosas de subtemas anteriores o del conocimiento previo del usuario(si los tiene)."
    ].join("\n");

    const railJson =
      "Devuelve EXCLUSIVAMENTE JSON válido (sin texto adicional) que cumpla este esquema.";

    // Mensaje de usuario con los datos del subtema (no repitas knowledge aquí)
    const userPayload = {
      subtopicTitle: subtopic.title,
      description: subtopic.description ?? "",
      objectives: subtopic.objectives
    };

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
        response_format: { type: "json_schema", json_schema: lessonSchema },
        messages: [
          { role: "system", content: railContext },
          { role: "system", content: railRules },
          { role: "system", content: railJson },
          {
            role: "user",
            content:
              "Genera la clase del subtema como JSON según el esquema. Datos del subtema: " +
              JSON.stringify(userPayload)
          }
        ],
        temperature: 0.3,
        max_tokens: 1600
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return Response.json({ error: "Vercel AI subtopicStarted failed", detail: text }, { status: 502 });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return Response.json({ error: "Respuesta vacía del modelo" }, { status: 502 });
    }

    const out = JSON.parse(content);

    // Validación mínima adicional
    if (!out?.lesson_markdown || !Array.isArray(out?.objectives)) {
      return Response.json({ error: "JSON inválido del tutor" }, { status: 502 });
    }

    return Response.json(out, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return Response.json(
      { error: "subtopicStarted failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}

