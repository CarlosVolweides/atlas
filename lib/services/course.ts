import { cosineSimilarity } from "ai";
import { createClient } from "../supabase/client";
import { User } from "@supabase/supabase-js";
import { CreateCourseParams } from "@/types/course";
import { buildRoleText } from "../utils/roleText";
import { buildFocus } from "../utils/focus";
import { ApiServices } from "./api";

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
        return data;
    },

    /**
     * Create a new course
     * @param course - The course to create
     * @returns The data of the course
     */
    async createCourse(course: CreateCourseParams) {

        /**
         * Build the role text and focus
         */
        const roleText = buildRoleText({
            mainTech: course.tecnologiaPrincipal,
            level: course.dificultad,
            requiredTools: course.requiredTools,
            priorKnowledge: course.priorKnowledge,
            outOfScope: course.outOfScope,
        });

        const focus = buildFocus({
            requiredTools: course.requiredTools,
            razonCurso: course.razonCurso,
        });

        /**
         * Call the system prompt creator
         */
        const systemPromptCreatorResponse = await fetch('/api/openai/systemPromptCreator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roleText,
                focus,
            }),
        });
        if (!systemPromptCreatorResponse.ok) {
            throw new Error('Failed to create course');
        }
        const data = await systemPromptCreatorResponse.json();


        /**
         * Call the planner
         */
        const plannerResponse = await fetch('/api/openai/planner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                knowledgeProfile: data.knowledge,
            }),
        });
        if (!plannerResponse.ok) {
            throw new Error('Failed to create course');
        }
        const plannerData = await plannerResponse.json();
        console.log("plannerData from service:", plannerData);

        return data;
    }
}