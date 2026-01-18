import { number } from "zod";
import { createClient } from "../supabase/client";
import {Subtema, Module, ModuleDB, EstadoSubtema} from "@/types/course";

export const SubtopicService = {

    async postSubtopics(modules : Module[], modulesDataDB: ModuleDB[]) {
        const supabase = createClient();

        if(!modules || modules.length === 0){
            throw new Error("El array de modulos esta vacío")
        }

        const moduleIdMap = new Map<number, number>();
        modulesDataDB.forEach(m => {
            if( !m.id ){
                throw new Error("No hay un id de un modulo en modulesDataDB")
            }  
            moduleIdMap.set(m.orden, m.id)
        });

        const subtopicPayload = modules.flatMap(module => {
            
            const moduloId = moduleIdMap.get(module.order);
            if (!moduloId) {
                throw new Error(`No se encontró modulo_id para el módulo orden ${module.order}`);
            }

            //Recorre el array de subtopics dentro de cada module
            return module.subtopics.map((subtema : Subtema) => ({
                modulo_id : moduloId,
                titulo: subtema.title,
                descripcion: subtema.description,
                estado: 'vacio',
                orden: subtema.order,                
            }));

        })
        

        const {data , error} = await supabase.from("Subtemas")
        .insert(subtopicPayload)
        .select()

        if(error){
            console.log("Error insertando subtemas:", error);
            throw error;
        }

        return data;
    },

    async updateSubtopicState(courseId: number, moduleOrder: number, subtopicOrder: number, nuevoEstado: EstadoSubtema){
        const supabase = createClient();
        
        const {data, error } = await supabase.rpc('actualizar_estado_subtema', {
            p_curso_id: courseId,
            p_orden_modulo: moduleOrder,
            p_orden_subtema: subtopicOrder,
            p_nuevo_estado: nuevoEstado
        })

        if (error) {
            throw error
        }
        
        return data
    }

}