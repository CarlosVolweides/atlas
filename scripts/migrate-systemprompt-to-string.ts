import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;

async function migrateSystemPrompt() {
  console.log("🔄 Iniciando migración de systemPrompt de JSON a string...\n");

  if (!supabaseUrl) {
    console.error("❌ Error: SUPABASE_URL no está definida en las variables de entorno");
    process.exit(1);
  }

  if (!supabaseKey) {
    console.error("❌ Error: SUPABASE_PUBLISHABLE_DEFAULT_KEY no está definida en las variables de entorno");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Validar conexión
    console.log("🔍 Validando conexión con Supabase...");
    const { error: healthError } = await supabase.from("Cursos").select("id").limit(1);
    if (healthError && healthError.code !== "PGRST116") {
      console.error("❌ Error de conexión:", healthError.message);
      process.exit(1);
    }
    console.log("✅ Conexión establecida\n");

    // Obtener todos los cursos con systemPrompt
    console.log("📥 Obteniendo cursos con systemPrompt...");
    const { data: cursos, error: fetchError } = await supabase
      .from("Cursos")
      .select("id, systemPrompt")
      .not("systemPrompt", "is", null);

    if (fetchError) {
      console.error("❌ Error al obtener cursos:", fetchError.message);
      throw fetchError;
    }

    if (!cursos || cursos.length === 0) {
      console.log("ℹ️  No se encontraron cursos con systemPrompt para migrar\n");
      return;
    }

    console.log(`📊 Se encontraron ${cursos.length} curso(s) con systemPrompt\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Procesar cada curso
    for (const curso of cursos) {
      const systemPrompt = curso.systemPrompt;

      // Si ya es un string (no JSON), saltar
      if (typeof systemPrompt === "string" && !systemPrompt.trim().startsWith("{")) {
        skipped++;
        continue;
      }

      try {
        // Intentar parsear como JSON
        let parsed: any;
        if (typeof systemPrompt === "string") {
          parsed = JSON.parse(systemPrompt);
        } else {
          parsed = systemPrompt;
        }

        // Si tiene la estructura { knowledge: "..." }, extraer el valor
        if (parsed && typeof parsed === "object" && "knowledge" in parsed) {
          const knowledgeValue = parsed.knowledge;
          
          if (typeof knowledgeValue === "string") {
            // Actualizar el curso con el string directo
            const { error: updateError } = await supabase
              .from("Cursos")
              .update({ systemPrompt: knowledgeValue })
              .eq("id", curso.id);

            if (updateError) {
              console.error(`❌ Error al actualizar curso ${curso.id}:`, updateError.message);
              errors++;
            } else {
              console.log(`✅ Curso ${curso.id} actualizado correctamente`);
              updated++;
            }
          } else {
            console.warn(`⚠️  Curso ${curso.id}: el valor de 'knowledge' no es un string, se omite`);
            skipped++;
          }
        } else {
          // Si no tiene la estructura esperada, mantener como está
          console.warn(`⚠️  Curso ${curso.id}: systemPrompt no tiene la estructura esperada, se omite`);
          skipped++;
        }
      } catch (parseError) {
        // Si no se puede parsear como JSON, probablemente ya es un string válido
        console.warn(`⚠️  Curso ${curso.id}: systemPrompt no es JSON válido, se omite`);
        skipped++;
      }
    }

    console.log("\n📈 Resumen de la migración:");
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⏭️  Omitidos: ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log("\n🎉 Migración completada");
  } catch (err: any) {
    console.error("❌ Error durante la migración:");
    console.error(`   ${err?.message ?? String(err)}`);
    process.exit(1);
  }
}

migrateSystemPrompt();
