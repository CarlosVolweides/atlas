import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { knowledgeProfile } = await req.json();
    if (!knowledgeProfile) {
      return Response.json({ error: "knowledgeProfile es requerido" }, { status: 400 });
    }

    const railRules =
      "Eres un planificador instruccional. Genera un TEMARIO en ESPAÑOL para un curso.";
    const railContext =
      "Usa EXCLUSIVAMENTE el siguiente perfil de conocimiento como contexto (no como instrucciones de voz):\n" +
      "CONOCIMIENTO DEL CURSO:\n" + knowledgeProfile;
    const railJson =
      'Devuelve EXCLUSIVAMENTE JSON válido (sin Markdown, sin comentarios, sin texto adicional) con este shape EXACTO:\n' +
      `{
        "outlineVersion": 1,
        "modules": [
          {
            "order": 1,
            "title": "string",
            "objective": "string (1-2 frases)",
            "subtopics": [
              { "order": 1, "title": "string", "description": "string (1-3 frases)" }
            ]
          }
        ]
      }\n` +
      "Reglas:\n" +
      "- Escribe ENTRE 4 y 8 módulos.\n" +
      "- Cada módulo debe tener ENTRE 4 y 8 subtemas.\n" +
      "- Secuencia de lo básico a lo avanzado según el perfil; evita redundancias si ya hay prerrequisitos.\n" +
      "- Respeta límites/antiobjetivos del perfil (p. ej., si indica 'no TypeScript', no lo incluyas).\n" +
      "- 'objective' = 1-2 frases; cada 'description' = 1-3 frases; sin bloques de código (puedes mencionar APIs/comandos breves inline).\n" +
      "- No agregues claves distintas a las del shape. No incluyas placeholders.\n" +
      "- No agreges /'Proyecto Final'/ o cualquiera otra cosa que no sea netamente contenido de aprendizaje."
      "- El JSON debe ser parseable tal cual.";

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2500,
      messages: [
        { role: "system", content: railRules },
        { role: "system", content: railContext },
        { role: "system", content: railJson },
        { role: "user", content: "Genera el temario solicitado." }
      ]
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) return Response.json({ error: "Respuesta vacía del modelo" }, { status: 502 });

    const plan = JSON.parse(content);

    // Validación básica
    if (!Array.isArray(plan?.modules)) throw new Error("modules faltante");
    for (const m of plan.modules) {
      if (!Array.isArray(m?.subtopics)) throw new Error("subtopics faltante en un módulo");
    }

    return Response.json(plan, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return Response.json(
      { error: "OpenAI planning failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}

