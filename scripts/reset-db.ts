import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;

async function resetDatabase() {
  console.log("🔄 Iniciando reset de base de datos...\n");

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


    // 1. Eliminar Contexto
    console.log("🗑️  Eliminando registros de Contexto...");
    const { error: contextoError } = await supabase
      .from("Contexto")
      .delete()
      .gte("id", 0);
    
    if (contextoError) {
      console.error("❌ Error al eliminar Contexto:", contextoError.message);
      throw contextoError;
    }
    console.log("✅ Contexto eliminado\n");

    // 2. Eliminar Subtemas
    console.log("🗑️  Eliminando registros de Subtemas...");
    const { error: subtemasError } = await supabase
      .from("Subtemas")
      .delete()
      .gte("id", 0);
    
    if (subtemasError) {
      console.error("❌ Error al eliminar Subtemas:", subtemasError.message);
      throw subtemasError;
    }
    console.log("✅ Subtemas eliminados\n");

    // 3. Eliminar Modulos
    console.log("🗑️  Eliminando registros de Modulos...");
    const { error: modulosError } = await supabase
      .from("Modulos")
      .delete()
      .gte("id", 0);
    
    if (modulosError) {
      console.error("❌ Error al eliminar Modulos:", modulosError.message);
      throw modulosError;
    }
    console.log("✅ Modulos eliminados\n");

    // 4. Eliminar Cursos
    console.log("🗑️  Eliminando registros de Cursos...");
    const { error: cursosError } = await supabase
      .from("Cursos")
      .delete()
      .gte("id", 0);
    
    if (cursosError) {
      console.error("❌ Error al eliminar Cursos:", cursosError.message);
      throw cursosError;
    }
    console.log("✅ Cursos eliminados\n");

    console.log("🎉 Reset de base de datos completado exitosamente");
  } catch (err: any) {
    console.error("❌ Error durante el reset de base de datos:");
    console.error(`   ${err?.message ?? String(err)}`);
    process.exit(1);
  }
}

resetDatabase();
