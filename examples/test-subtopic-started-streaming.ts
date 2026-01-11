import "dotenv/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function testSubtopicStartedStreaming() {
  console.log("🔍 Validando configuración...\n");

  console.log("✅ Configuración:");
  console.log(`   - API URL: ${API_URL}`);
  console.log(`   - Endpoint: /api/vercelai/subtopicStarted(streming)\n`);

  console.log("📡 Haciendo petición streaming al endpoint de Next.js...\n");
  console.log("📝 Respuesta del endpoint (streaming):\n");
  console.log("─".repeat(60));

  try {
    const res = await fetch(`${API_URL}/api/vercelai/subtopicStarted(streming)`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        knowledgeProfile: "Experto en TypeScript con conocimiento profundo de tipos avanzados, generics, y decoradores.",
        subtopic: {
          title: "Introducción a TypeScript",
          description: "Conceptos básicos de TypeScript para desarrolladores JavaScript"
        }
      })
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "No se pudo leer el error");
      console.error(`\n❌ Error en la petición:`);
      console.error(`   - Status: ${res.status} ${res.statusText}`);
      console.error(`   - Detalle: ${errorText}`);
      process.exit(1);
    }

    if (!res.body) {
      console.error("\n❌ Error: No se recibió stream del endpoint");
      process.exit(1);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        // El endpoint devuelve texto plano directamente, no SSE
        const chunk = decoder.decode(value, { stream: true });
        process.stdout.write(chunk);
        fullContent += chunk;
      }
    } finally {
      reader.releaseLock();
    }

    console.log("\n");
    console.log("─".repeat(60));
    console.log("\n✅ Streaming completado exitosamente");
    console.log(`📊 Total de caracteres recibidos: ${fullContent.length}`);
    console.log("🎉 Endpoint de streaming está funcionando correctamente");
  } catch (err: any) {
    console.error("\n❌ Error al hacer la petición:");
    console.error(`   ${err?.message ?? String(err)}`);
    if (err?.code === "ECONNREFUSED") {
      console.error("\n💡 Asegúrate de que el servidor Next.js esté corriendo:");
      console.error("   pnpm dev");
    }
    process.exit(1);
  }
}

testSubtopicStartedStreaming();
