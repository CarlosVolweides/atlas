import { cosineSimilarity } from "ai";
import { createClient } from "../supabase/client";
import { User } from "@supabase/supabase-js";
import { CreateCourseParams, ModuleDB, PlannerModules } from "@/types/course";
import { buildRoleText } from "../utils/roleText";
import { buildFocus } from "../utils/focus";
import { ApiServices } from "./api";
import { SubtopicService } from "./subtopic";

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
    throw new Error("Usuario no autenticado.");
}

export const CourseService = {

    /**
     * Get all courses
     * @returns The data of the courses
     */
    async getCourses() {
        
        const { data, error } = await supabase.from('Cursos').select('*').filter('user_id', 'eq', user.id);
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
        const systemPromptData = await systemPromptCreatorResponse.json();
        console.log("Info del systemPromptData: ", systemPromptData)

        /**
         * Call the planner
         */
        const plannerResponse = await fetch('/api/openai/planner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                knowledgeProfile: systemPromptData.knowledge,
            }),
        });
        if (!plannerResponse.ok) {
            throw new Error('Failed to create course');
        }
        const plannerData = await plannerResponse.json(); // : tipado plannerData
        console.log("plannerData from service:", plannerData);

        /**
         *  Create Course in Supabase
         */
        const postCourse = async () =>{

            const coursePayload = {
                tecnologia: course.tecnologiaPrincipal,
                dificultad: course.dificultad,
                razonCurso: course.razonCurso,
                herramientasRequeridas: course.requiredTools ?? null,
                conocimientosPrevios: course.priorKnowledge ?? null,
                tecnologiasExcluidas: course.outOfScope ?? null,
                user_id: user.id,
                esquemaTemario:
                    typeof plannerData === "string"
                        ? JSON.parse(plannerData)
                        : plannerData,
                systemPrompt: systemPromptData ?? "",
            };

            return supabase.from("Cursos")
            .insert(coursePayload).select().single()
        }

        const { data: courseData, error: courseError } = await postCourse();
        if (courseError) {            
            throw new Error(`Fallo al insertar el curso: ${courseError.message}`);
        }
        console.log(`Info del curso registrado:`, courseData);

        const courseId: number = courseData.id;
        console.log(`Curso insertado exitosamente con ID: ${courseId}`);

         /**
          * Create modules in supabase
          */
        const postModules = async () =>{
            const modulesToInsert: ModuleDB[] = plannerData.modules.map((module: PlannerModules) => {
                if (!module.title || typeof module.title !== "string") {
                    throw new Error("Módulo sin título válido");
                }

                return {
                    curso_id: courseId,
                    titulo: module.title,
                    orden: module.order ?? null,
                    objetivo: module.objective ?? null,
                }
            });
            
            const { data, error } = await supabase
                .from('Modulos') 
                .insert(modulesToInsert)
                .select();

            if (error) {
                throw new Error(`Error al insertar módulos: ${error.message}`);
            }
            return data
        }

        const modulesData = await postModules();
        console.log("Info de modulos registrados:", modulesData)


        /**
         * Create Subtopics in supabase
         */

        const createSubtopics = await SubtopicService.postSubtopics(plannerData.modules, modulesData)
        console.log("Info de subtemas registrados: ", createSubtopics)
        
        return systemPromptData;
    }
}