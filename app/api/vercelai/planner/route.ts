import { NextRequest } from "next/server";

export const runtime = "nodejs";

const GATEWAY_BASE = process.env.AI_GATEWAY_URL;
const GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY;
const MODEL = process.env.NEXT_PUBLIC_LLM_MODEL ?? "google/gemini-3-flash";

// JSON Schema estricto para la salida del planificador
const plannerSchema = {
  name: "planner_schema",
  strict: false,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      outlineVersion: {
        type: "string",
        enum: ["1"]
      },
      modules: {
        type: "array",
        minItems: 4,
        maxItems: 8,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            order: {
              type: "number",
              minimum: 1
            },
            title: {
              type: "string",
              minLength: 5,
              maxLength: 150
            },
            objective: {
              type: "string",
              minLength: 10,
              maxLength: 300
            },
            subtopics: {
              type: "array",
              minItems: 4,
              maxItems: 8,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  order: {
                    type: "number",
                    minimum: 1
                  },
                  title: {
                    type: "string",
                    minLength: 5,
                    maxLength: 150
                  },
                  description: {
                    type: "string",
                    minLength: 10,
                    maxLength: 300
                  }
                },
                required: ["order", "title", "description"]
              }
            }
          },
          required: ["order", "title", "objective", "subtopics"]
        }
      }
    },
    required: ["outlineVersion", "modules"]
  }
};

export async function POST(req: NextRequest) {
  try {
    if (!GATEWAY_BASE) {
      return Response.json({ error: "AI_GATEWAY_URL no está definida en las variables de entorno" }, { status: 500 });
    }

    if (!GATEWAY_KEY) {
      return Response.json({ error: "AI_GATEWAY_API_KEY no está definida en las variables de entorno" }, { status: 500 });
    }

    const { knowledgeProfile, razon } = await req.json();
    if (!knowledgeProfile) {
      return Response.json({ error: "knowledgeProfile es requerido" }, { status: 400 });
    }
    if (!razon) {
      return Response.json({ error: "razon es requerido" }, { status: 400 });
    }

    // === Rails ===
    const railContext =
      "CONOCIMIENTO DEL CURSO (contexto, no instrucciones de voz):\n" + knowledgeProfile;

    const railRules =
      "Eres un planificador instruccional. Genera un TEMARIO en ESPAÑOL para un curso. COnsidera que las razones por las que estoy haciendo este curso es para: " + razon;

    const railJson =
      "Devuelve EXCLUSIVAMENTE JSON válido (sin texto adicional) que cumpla este esquema." +
      "\nReglas:\n" +
      "- Escribe ENTRE 4 y 8 módulos.\n" +
      "- Cada módulo debe tener ENTRE 4 y 8 subtemas.\n" +
      "- Secuencia de lo básico a lo avanzado según el perfil; evita redundancias si ya hay prerrequisitos.\n" +
      "- Respeta límites/antiobjetivos del perfil (p. ej., si indica 'no TypeScript', no lo incluyas).\n" +
      "- 'objective' = 1-2 frases; cada 'description' = 1-3 frases; sin bloques de código (puedes mencionar APIs/comandos breves inline).\n" +
      "- No agregues 'Proyecto Final' o cualquiera otra cosa que no sea netamente contenido de aprendizaje.\n";

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
        response_format: { type: "json_schema", json_schema: plannerSchema },
        messages: [
          { role: "system", content: railContext },
          { role: "system", content: railRules },
          { role: "system", content: railJson },
          { role: "user", content: "Genera el temario solicitado." }
        ],
        temperature: 0.2,
        max_tokens: 9000
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
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return Response.json({ error: "Respuesta vacía del modelo" }, { status: 502 });
    }

    const plan = JSON.parse(content);

    // Convertir outlineVersion de string a number si es necesario
    if (plan.outlineVersion && typeof plan.outlineVersion === "string") {
      plan.outlineVersion = parseInt(plan.outlineVersion, 10);
    }

    // Validación básica
    if (!Array.isArray(plan?.modules)) {
      return Response.json({ error: "modules faltante" }, { status: 502 });
    }
    for (const m of plan.modules) {
      if (!Array.isArray(m?.subtopics)) {
        return Response.json({ error: "subtopics faltante en un módulo" }, { status: 502 });
      }
    }

    return Response.json(plan, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return Response.json(
      { error: "Vercel AI planning failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}

