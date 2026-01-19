import "dotenv/config";

const GATEWAY_BASE = process.env.AI_GATEWAY_URL;
const GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY;
const MODEL = process.env.NEXT_PUBLIC_LLM_MODEL ?? "google/gemini-3-flash";

async function testVercelGateway() {
  console.log("🔍 Validando variables de entorno...\n");

  if (!GATEWAY_BASE) {
    console.error("❌ Error: AI_GATEWAY_URL no está definida en las variables de entorno");
    process.exit(1);
  }

  if (!GATEWAY_KEY) {
    console.error("❌ Error: AI_GATEWAY_API_KEY no está definida en las variables de entorno");
    process.exit(1);
  }

  console.log("✅ Variables de entorno encontradas:");
  console.log(`   - AI_GATEWAY_URL: ${GATEWAY_BASE}`);
  console.log(`   - AI_MODEL: ${MODEL}`);
  console.log(`   - AI_GATEWAY_API_KEY: ${GATEWAY_KEY.substring(0, 10)}...\n`);

  console.log("📡 Haciendo petición a Vercel AI Gateway...\n");

  try {
    const res = await fetch(`${GATEWAY_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GATEWAY_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          { role: "user", content: "Hola, responde con 'OK' si me escuchas" }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "No se pudo leer el error");
      console.error(`❌ Error en la petición:`);
      console.error(`   - Status: ${res.status} ${res.statusText}`);
      console.error(`   - Detalle: ${errorText}`);
      process.exit(1);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("❌ Error: La respuesta no contiene contenido");
      console.error("Respuesta completa:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log("✅ Petición exitosa!\n");
    console.log("📝 Respuesta del modelo:");
    console.log(`   ${content}\n`);
    console.log("🎉 Vercel AI Gateway está funcionando correctamente");
  } catch (err: any) {
    console.error("❌ Error al hacer la petición:");
    console.error(`   ${err?.message ?? String(err)}`);
    process.exit(1);
  }
}

testVercelGateway();
