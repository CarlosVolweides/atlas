import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    const { roleText, focus } = await req.json();
    if (!roleText) {
      return NextResponse.json({ error: "roleText requerido" }, { status: 400 });
    }

    const system = [
      // Propósito
      "Redacta un perfil de conocimiento para un tutor de curso en desarrollo de software.",
      "La salida debe ser UN SOLO TEXTO en español (sin JSON, sin listas de reglas del sistema, sin backticks).",
    
      // Qué debe contener (contenido, no tono)
      "Integra y sintetiza la información proporcionada en 'roleText' y 'focus' para describir:",
      "- Áreas y alcances de conocimiento (qué sabe y hasta dónde).",
      "- Tecnologías, frameworks, herramientas y bases de datos relevantes al tema.",
      "- Fundamentos y principios clave que domina.",
      "- Objetivo principal del curso (en 1-2 frases) usando 'focus'.",
      "- Capacidades pedagógicas (solo como atributos de conocimiento, no instrucciones de voz).",
      "- Límites y fuera de alcance si se deducen del material.",
    
      // Estructura deseada (en lenguaje natural)
      "Estructura exacta del texto:",
      "1) Párrafo(s) inicial(es): síntesis del experto y su campo.",
      "2) Encabezado: 'Objetivo Principal:' seguido de 1-2 frases.",
      "3) Encabezado: 'Características y Habilidades Clave:' seguido de párrafos y/o listas normales.",
      "   - Puedes usar numeración o guiones, pero mantén todo como prosa natural.",
      "4) (Opcional) Menciona límites/antiobjetivos si aplican.",
    
      // Reglas de forma
      "Reglas de forma:",
      "- Escribe entre 250 y 500 palabras.",
      "- No incluyas instrucciones sobre cómo debe hablar el modelo, ni el tono, ni formatos conversacionales.",
      "- No repitas literalmente el input; normaliza y resume.",
      "- Adapta tecnologías al dominio indicado (p. ej., si 'focus' pide PHP con Laravel, el texto debe reflejarlo).",
      "- No añadas nada fuera del texto solicitado."
    ].join("\n");

    const user = JSON.stringify({
      roleText,
      focus: focus ?? ""
    });

    const r = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    // Validar que la respuesta tenga contenido
    if (!r.choices || r.choices.length === 0) {
      return NextResponse.json({ error: "No se recibieron opciones del modelo" }, { status: 502 });
    }

    const content = r.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({ error: "Respuesta vacía del modelo" }, { status: 502 });
    }

    // Retornar el texto directamente
    return NextResponse.json(
      { knowledge: content }, 
      { 
        status: 200, 
        headers: { "Cache-Control": "no-store" } 
      }
    );
  } catch (err: any) {
    // Manejar errores de OpenAI API
    if (err instanceof Error && err.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: "Error de OpenAI API", detail: err.message },
        { status: 502 }
      );
    }
    
    return NextResponse.json(
      { error: "systemPromptCreator failed", detail: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}

