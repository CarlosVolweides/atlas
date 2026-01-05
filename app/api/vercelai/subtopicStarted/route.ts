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
      title: { 
        type: "string",
        minLength: 10,
        maxLength: 150
      },
      content: { 
        type: "string", 
        minLength: 800, 
        maxLength: 6000 
      },
      estimated_read_time_min: { 
        type: "number",
        minimum: 1,
        maximum: 30
      }
    },
    required: ["title", "content"]
  }
} as const;

export async function POST(req: NextRequest) {
  try {
    const { knowledgeProfile, subtopic } = await req.json();

    // subtopic: { title: string; description?: string; }
    if (!knowledgeProfile) {
      return Response.json({ error: "knowledgeProfile es requerido" }, { status: 400 });
    }
    if (!subtopic?.title) {
      return Response.json({ error: "subtopic.title es requerido" }, { status: 400 });
    }

    // === Rails ===
    const railContext =
      "CONOCIMIENTO DEL CURSO (contexto, no instrucciones de voz):\n" + knowledgeProfile;

    const railRules = [
      "Eres un tutor técnico experto. Debes crear una LECCIÓN COMPLETA y DETALLADA enfocada EXCLUSIVAMENTE en el subtema indicado.",
      "Prohibido adelantar contenido de otros subtemas; enseña solo lo necesario para este subtema específico.",
      "Idioma: ESPAÑOL. Usa Markdown para formatear el contenido.",
      
      "ESTRUCTURA OBLIGATORIA de la lección:",
      "1. TÍTULO: Debe incluir el nombre del subtema, una descripción breve y un emoji relevante. Formato: 'Nombre del Subtema: Descripción Breve 🔄'",
      "2. INTRODUCCIÓN CONCEPTUAL: 2-3 párrafos que expliquen el concepto de manera clara, usando analogías cuando sea útil. Debe ser accesible y educativo.",
      "3. VALOR CLAVE: Una sección que explique por qué es importante este concepto y qué problema resuelve.",
      "4. EJEMPLOS PRÁCTICOS: Incluye ejemplos de código reales y funcionales. Cada bloque de código debe:",
      "   - Estar precedido por una explicación del contexto",
      "   - Estar en bloques de código markdown con el lenguaje especificado (```typescript, ```javascript, etc.)",
      "   - Tener comentarios explicativos cuando sea necesario",
      "   - Ir seguido de una explicación de qué hace el código y por qué es útil",
      "5. SECCIONES ADICIONALES: Puedes incluir secciones como 'Tipos de Utilidad', 'Decoradores Personalizados', 'Tipos Condicionales', etc., según el subtema.",
      "6. CIERRE: Un párrafo final que conecte el concepto con el contexto más amplio del curso.",
      
      "ESTILO Y TONO:",
      "- Escribe de forma narrativa y educativa, como si estuvieras explicando a un compañero de trabajo",
      "- Usa analogías y metáforas para hacer los conceptos más accesibles",
      "- Sé específico y práctico, evita abstracciones innecesarias",
      "- El código debe ser real y funcional, no pseudocódigo",
      "- Usa emojis en los títulos de secciones principales para hacer el contenido más visual",
      
      "LÍMITES Y REGLAS:",
      "- No incluyas contenido de subtemas futuros",
      "- Mantén la lección entre 800 y 6000 palabras (más detallada que antes)",
      "- Cada bloque de código debe ser completo pero conciso (máximo 20-25 líneas)",
      "- Puedes referenciar conceptos de subtemas anteriores o del conocimiento previo del usuario",
      "- El contenido debe ser autónomo: alguien que lea solo esta lección debe entender el concepto",
      "- Integra los objetivos de aprendizaje dentro del contenido narrativo, no como lista separada"
    ].join("\n");

    const railJson =
      "Devuelve EXCLUSIVAMENTE JSON válido (sin texto adicional) que cumpla este esquema.";

    // Mensaje de usuario con los datos del subtema (no repitas knowledge aquí)
    const userPayload = {
      subtopicTitle: subtopic.title,
      description: subtopic.description ?? ""
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
        max_tokens: 4000
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
    if (!out?.content || !out?.title) {
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

