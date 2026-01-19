import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;

async function migrateTecnologiaToTitulo() {
  console.log("🔄 Iniciando migración de tecnologia a titulo...\n");

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

    // Obtener todos los cursos con tecnologia
    console.log("📥 Obteniendo cursos con tecnologia...");
    const { data: cursos, error: fetchError } = await supabase
      .from("Cursos")
      .select("id, tecnologia, titulo")
      .not("tecnologia", "is", null);

    if (fetchError) {
      console.error("❌ Error al obtener cursos:", fetchError.message);
      throw fetchError;
    }

    if (!cursos || cursos.length === 0) {
      console.log("ℹ️  No se encontraron cursos con tecnologia para migrar\n");
      return;
    }

    console.log(`📊 Se encontraron ${cursos.length} curso(s) con tecnologia\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Procesar cada curso
    for (const curso of cursos) {
      const tecnologia = curso.tecnologia;
      const titulo = curso.titulo;

      // Si tecnologia es null o vacío, saltar
      if (!tecnologia || tecnologia.trim() === "") {
        console.warn(`⚠️  Curso ${curso.id}: tecnologia está vacío, se omite`);
        skipped++;
        continue;
      }

      // Si titulo ya tiene el mismo valor que tecnologia, saltar
      if (titulo === tecnologia) {
        skipped++;
        continue;
      }

      try {
        // Actualizar el curso con tecnologia en titulo
        const { error: updateError } = await supabase
          .from("Cursos")
          .update({ titulo: tecnologia })
          .eq("id", curso.id);

        if (updateError) {
          console.error(`❌ Error al actualizar curso ${curso.id}:`, updateError.message);
          errors++;
        } else {
          console.log(`✅ Curso ${curso.id} actualizado: "${tecnologia}" -> titulo`);
          updated++;
        }
      } catch (updateErr: any) {
        console.error(`❌ Error al actualizar curso ${curso.id}:`, updateErr?.message ?? String(updateErr));
        errors++;
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

migrateTecnologiaToTitulo();
