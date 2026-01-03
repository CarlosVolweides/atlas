import { createClient } from "../supabase/client";
import {Subtema, Module, ModuleDB} from "@/types/course";

const supabase = createClient();

export const ContextService = {

    async getContextBySubtopic(courseId: number, moduleOrder: number, subtopicOrder: number) {

        const { data, error } = await supabase
            .from('Contexto') 
            .select(`
            *,
            Subtemas!inner(
                orden,
                Modulos!inner(
                orden,
                curso_id
                )
            )
            `)
            .eq('Subtemas.orden', subtopicOrder)
            .eq('Subtemas.Modulos.orden', moduleOrder)
            .eq('Subtemas.Modulos.curso_id', courseId)
            .single(); // un registro

        if (error) {
            console.error("Error obteniendo el contexto:", error);
            return null;
        }
        console.log("contexto obtenido por getContextBySubtopic:", data)
        return data;
    }

    

}