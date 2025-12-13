import { createClient } from "../supabase/client";
import {Subtema} from "@/types/course";

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

export const SubtopicService = {

    // Guardar subtemas de la respuesta del planner
    async postSubtopics(subtemas : string[], cursoId: number ) {

        if(!subtemas || subtemas.length === 0){
            throw new Error("El array de subtemas esta vacío")
        }
        const payload = subtemas.map((subtema) => ({
            titulo: subtema,
            cursoId : cursoId,
            estado: 'pendiente',
        }));

        const {data , error} = await supabase.from("Subtemas")
        .insert(payload)
        .select()

        if(error){
            console.log("Error insertando subtemas:", error);
            throw error;
        }
        console.log("Subtemas guardados correctamente:", data);
        return data
    }

}