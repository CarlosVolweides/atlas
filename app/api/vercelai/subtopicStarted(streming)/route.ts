import { NextRequest } from "next/server";

export const runtime = "nodejs";

const GATEWAY_BASE = process.env.AI_GATEWAY_URL!;
const GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY!;
const MODEL = process.env.AI_MODEL ?? "openai/gpt-4o-mini";


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
      "- Integra los objetivos de aprendizaje dentro del contenido narrativo, no como lista separada",
      "- Devuelve SOLO el contenido markdown de la lección, sin JSON, sin estructura adicional"
    ].join("\n");

    // Mensaje de usuario con los datos del subtema
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
        stream: true,
        messages: [
          { role: "system", content: railContext },
          { role: "system", content: railRules },
          {
            role: "user",
            content:
              "Genera la clase del subtema en formato Markdown. Datos del subtema: " +
              JSON.stringify(userPayload)
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return Response.json({ error: "Vercel AI subtopicStarted streaming failed", detail: text }, { status: 502 });
    }

    if (!res.body) {
      return Response.json({ error: "No se recibió stream del modelo" }, { status: 502 });
    }

    // Crear un ReadableStream que procese los chunks del stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }

            // Decodificar el chunk
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            // Procesar cada línea del SSE stream
            for (const line of lines) {
              if (line.trim() === "") continue;
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                
                if (data === "[DONE]") {
                  controller.close();
                  return;
                }

                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    // Enviar el chunk de contenido como texto
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignorar errores de parsing de líneas incompletas
                }
              }
            }
          }

          // Procesar el buffer restante
          if (buffer.trim()) {
            if (buffer.startsWith("data: ")) {
              const data = buffer.slice(6);
              if (data !== "[DONE]") {
                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    const encoder = new TextEncoder();
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  // Ignorar errores de parsing
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });

    // Devolver el stream con headers apropiados para streaming
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (err: any) {
    return Response.json(
      { error: "subtopicStarted streaming failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}

