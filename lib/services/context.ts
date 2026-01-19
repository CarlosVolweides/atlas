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

        // 2. Verificar si ya existe un contexto para este subtema
        // Usamos maybeSingle() que retorna null si no encuentra resultados (sin error)
        const { data: existingContext } = await supabase
            .from('Contexto')
            .select('id')
            .eq('subtema_id', subtopic.id)
            .maybeSingle();

        // Si existingContext tiene datos, significa que existe y debemos actualizar
        // Si es null, no existe y debemos insertar
        if (existingContext && existingContext.id) {
            // 3a. Si existe, actualizar el contexto existente usando su ID
            console.log('Actualizando contexto existente con id:', existingContext.id, 'para subtema_id:', subtopic.id);
            const { data: updateData, error: updateError } = await supabase
                .from('Contexto')
                .update({
                    content: contentData.content
                })
                .eq('id', existingContext.id) // Usar el ID del contexto existente
                .select()
                .single();
            
            if (updateError) {
                console.error('Error al actualizar contexto:', updateError);
                throw updateError;
            }
            
            console.log('Contexto actualizado exitosamente');
            return updateData;
        } else {
            // 3b. Si no existe, insertar un nuevo contexto
            console.log('Insertando nuevo contexto para subtema_id:', subtopic.id);
            const { data: insertData, error: insertError } = await supabase
                .from('Contexto')
                .insert([
                {
                    subtema_id: subtopic.id,
                    content: contentData.content
                }
                ])
                .select()
                .single();
            
            if (insertError) {
                console.error('Error al insertar contexto:', insertError);
                throw insertError;
            }
            
            console.log('Contexto insertado exitosamente');
            return insertData;
        }
    }

    

}