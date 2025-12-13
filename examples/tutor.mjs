// scripts/tutor-example.mjs
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Subtema de ejemplo (puedes editarlo)
const subtopic = {
  title: "Rutas y navegación en Next.js",
  description: "Aprender a manejar rutas y navegación entre páginas en Next.js.",
  objectives: [
    "Crear rutas dinámicas en Next.js",
    "Implementar la navegación entre páginas"
  ]
};

// Prompt del tutor (versión “explicación larga en Markdown”)
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
  "Usa lenguaje simple, sin relleno, y conecta con los objectives.",
].join("\n");

const user = JSON.stringify(subtopic);

async function run() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Falta OPENAI_API_KEY en el entorno.");
    }

    const resp = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1200,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content:
            "Genera la explicación en Markdown siguiendo la estructura. Datos del subtema: " +
            user
        }
      ]
    });

    const md = resp.choices?.[0]?.message?.content?.trim();
    if (!md) throw new Error("Respuesta vacía del modelo.");
    console.log(md);
  } catch (err) {
    console.error("Tutor example error:", err?.message || err);
    process.exitCode = 1;
  }
}

run();
