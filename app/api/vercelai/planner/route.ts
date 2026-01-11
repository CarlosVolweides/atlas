import { NextRequest } from "next/server";

export const runtime = "nodejs";

const GATEWAY_BASE = process.env.AI_GATEWAY_URL;
const GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY;
const MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    if (!GATEWAY_BASE) {
      return Response.json({ error: "AI_GATEWAY_URL no está definida en las variables de entorno" }, { status: 500 });
    }

    if (!GATEWAY_KEY) {
      return Response.json({ error: "AI_GATEWAY_API_KEY no está definida en las variables de entorno" }, { status: 500 });
    }

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
      "- No agregues /'Proyecto Final'/ o cualquiera otra cosa que no sea netamente contenido de aprendizaje.\n" +
      "- El JSON debe ser parseable tal cual.";

    const systemPrompt = `${railRules}\n\n${railContext}\n\n${railJson}`;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: "Genera el temario solicitado." }
        ],
        temperature: 0.2,
        max_tokens: 2500
      })
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "No se pudo leer el error");
      return Response.json(
        { 
          error: "Vercel AI planning failed", 
          detail: errorText,
          status: res.status,
          statusText: res.statusText
        }, 
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json({ error: "Respuesta vacía del modelo" }, { status: 502 });
    }

    const plan = JSON.parse(content);

    // Validación básica
    if (!Array.isArray(plan?.modules)) throw new Error("modules faltante");
    for (const m of plan.modules) {
      if (!Array.isArray(m?.subtopics)) throw new Error("subtopics faltante en un módulo");
    }

    return Response.json(plan, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return Response.json(
      { error: "Vercel AI planning failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}

