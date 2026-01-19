import { createClient } from "../supabase/client";
import {Subtema, Module, ModuleDB} from "@/types/course";

export const ContextService = {

    async getContextBySubtopic(courseId: number, moduleOrder: number, subtopicOrder: number) {
        const supabase = createClient();

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
            .maybeSingle(); // retorna null si no hay resultados, sin error

        if (error) {
            console.error("Error obteniendo el contexto:", error);
            return null;
        }
        console.log("contexto obtenido por getContextBySubtopic:", data)
        return data;
    },

    async postContext(courseId: number, moduleOrder: number, subtopicOrder: number, 
        contentData: {title: string; content: string; estimated_read_time_min?: number}) {
        const supabase = createClient();

        // 1. Buscamos el ID del subtema navegando por la jerarquía
        const { data: subtopic, error: subtopicError } = await supabase
            .from('Subtemas')
            .select(`
            id,
            Modulos!inner(orden, curso_id)
            `)
            .eq('orden', subtopicOrder)
            .eq('Modulos.orden', moduleOrder)
            .eq('Modulos.curso_id', courseId)
            .single();

        if (subtopicError || !subtopic) {
            throw new Error('No se encontró el subtema correspondiente para este curso y módulo.');
        }

        // 2. Insertamos el nuevo contexto usando el ID encontrado
        const { data, error: insertError } = await supabase
            .from('Contexto')
            .insert([
            {
                subtema_id: subtopic.id, // Tu FK hacia subtemas
                content: contentData.content
            }
            ])
            .select()
            .single();

        if (insertError) throw insertError;
        return data;
    }

    

}