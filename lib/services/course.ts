import { cosineSimilarity } from "ai";
import { createClient } from "../supabase/client";
import { User } from "@supabase/supabase-js";
import { Curso } from "@/types/course";

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

export const CourseService = {

    /**
     * Get all courses
     * @returns The data of the courses
     */
    async getCourses() {
        const { data, error } = await supabase.from('Cursos').select('*');
        if (error) {
            throw error;
        }
        console.log("data from service:", data);
        return data;
    }
}