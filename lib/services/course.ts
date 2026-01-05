import { cosineSimilarity } from "ai";
import { createClient } from "../supabase/client";
import { User } from "@supabase/supabase-js";
import { CreateCourseParams, CursoCardI, ModuleDB, PlannerModules } from "@/types/course";
import { buildRoleText } from "../utils/roleText";
import { buildFocus } from "../utils/focus";
import { ApiServices } from "./api";
import { SubtopicService } from "./subtopic";
import { buildSubtopicStateMap, enrichTemaryWithState } from "../utils/mapSubtopicsState";

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
        if (!user) {
            throw new Error("Usuario no autenticado. No es posible obtener");
        }

        const { data, error } = await supabase.from('vista_progreso_cursos')
        .select('*')
        .eq('user_id', user.id);
        if (error) {
            throw error;
        }
        const dataCourses = data
        dataCourses.forEach(course => {
            course.progreso = Math.round(course.temas_completados/course.total_temas * 100);
            return course
        });
        return dataCourses;
    },

    /**
     * Create a new course
     * @param course - The course to create
     * @returns The data of the course
     */
    async createCourse(course: CreateCourseParams) {

        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                id: 3,
                courseId: 3,
                tecnologia: course.tecnologiaPrincipal,
                dificultad: course.dificultad,
                razonCurso: course.razonCurso,
            };
        }

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
        const systemPromptData = await ApiServices.systemPromptCreator.create(roleText, focus);
        console.log("Info del systemPromptData: ", systemPromptData)

        /**
         * Call the planner
         */
        const plannerData = await ApiServices.planner.create(systemPromptData.knowledge);
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
                systemPrompt: systemPromptData.knowledge ?? "",
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
        
        return {
            id: courseId,
            courseId: courseId,
            ...courseData
        };
    },

    async getTemaryByCourseId(courseId: number) {
        const { data: temaryData, error } = await supabase.from('Cursos').select('esquemaTemario').eq('id', courseId).single();
        if (error) {
            throw new Error(`Error al obtener temario de Curso: ${error.message}`);;
        }

        const {data: statusSubtopics, error: SubtopicsError} = await supabase.from('Cursos')
        .select(`
        id,
        Modulos (
            Subtemas (
            titulo,
            estado,
            id
            )
        )
        `)
        .eq('id', courseId)
        .order('id', { foreignTable: 'Modulos.Subtemas', ascending: true })
        .single();

        if (SubtopicsError) {
            throw new Error(`Error al obtener temario de Curso: ${SubtopicsError.message}`);;
        }
        
        const temary = temaryData?.esquemaTemario

        const stateMap = buildSubtopicStateMap(statusSubtopics);
        
        const temaryWithState = enrichTemaryWithState(temary, stateMap);

        console.log("temaryWithState:", temaryWithState)
        return temaryWithState || null;
    }
}