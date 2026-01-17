import { createClient } from "../supabase/client";
import { CreateCourseParams, ModuleDB, PlannerModules } from "@/types/course";
import { buildRoleText } from "../utils/roleText";
import { buildFocus } from "../utils/focus";
import { ApiServices } from "./api";
import { SubtopicService } from "./subtopic";
import { buildSubtopicStateMap, enrichTemaryWithState } from "../utils/mapSubtopicsState";

/**
 * Helper function to get authenticated user and supabase client
 * This ensures the token is refreshed if needed before checking authentication
 */
async function getAuthenticatedUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        throw new Error("Usuario no autenticado. Por favor, inicia sesión.");
    }
    
    return { user, supabase };
}

export const CourseService = {

    /**
     * Get all courses with pagination
     * @param page - Page number (default: 1)
     * @param limit - Number of courses per page (default: 9)
     * @returns Object with courses and total count
     */
    async getCourses(page: number = 1, limit: number = 9) {
        const { user, supabase } = await getAuthenticatedUser();

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Get total count
        const { count, error: countError } = await supabase
            .from('vista_progreso_cursos')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        
        if (countError) {
            throw countError;
        }

        // Get paginated data
        const { data, error } = await supabase.from('vista_progreso_cursos')
        .select('*')
        .eq('user_id', user.id)
        .range(from, to);
        
        if (error) {
            throw error;
        }
        
        // Obtener las dificultades de los cursos
        const courseIds = data?.map(course => course.id || course.curso_id).filter(Boolean) || [];
        let dificultadesMap: Record<number, string | null> = {};
        
        if (courseIds.length > 0) {
            const { data: cursosData, error: cursosError } = await supabase
                .from('Cursos')
                .select('id, dificultad')
                .in('id', courseIds);
            
            if (!cursosError && cursosData) {
                dificultadesMap = cursosData.reduce((acc, curso) => {
                    acc[curso.id] = curso.dificultad;
                    return acc;
                }, {} as Record<number, string | null>);
            }
        }
        
        const dataCourses = data
        dataCourses.forEach(course => {
            course.progreso = Math.round(course.temas_completados/course.total_temas * 100);
            const courseId = course.id || course.curso_id;
            course.dificultad = courseId ? dificultadesMap[courseId] || null : null;
            return course
        });
        
        return {
            courses: dataCourses,
            total: count || 0
        };
    },

    /** 
     * Get info of one Course 
     */
    async getCourseInfo(cursoId: number) {
        const supabase = createClient();
        
        const { data: courseInfo, error } = await supabase.from('Cursos')
        .select('tecnologia, dificultad, conocimientosPrevios, herramientasRequeridas, tecnologiasExcluidas, systemPrompt')
        .eq('id', cursoId)
        .single();

        if (error) {
             throw new Error(`Fallo al obtener info del curso: ${error.message}`);
        }
        console.log("courseInfo", courseInfo)
        return courseInfo;
    },

    /**
     * Create a new course
     * @param course - The course to create
     * @returns The data of the course
     */
    async createCourse(course: CreateCourseParams) {

        if (process.env.NEXT_PUBLIC_LLM_ACTIVE && process.env.NEXT_PUBLIC_LLM_ACTIVE === "false") {
            console.log("Creating course in development mode")
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                id: 3,
                courseId: 3,
                tecnologia: course.tecnologiaPrincipal,
                dificultad: course.dificultad,
                razonCurso: course.razonCurso,
            };
        }
        console.log("Creating course in production mode")
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
        const plannerData = await ApiServices.planner.create(systemPromptData, course.razonCurso);
        console.log("plannerData from service:", plannerData);

        /**
         *  Create Course in Supabase
         */
        const { user, supabase } = await getAuthenticatedUser();
        
        const postCourse = async () =>{
            // Helper para manejar arrays: si existe (incluso vacío), guardarlo; si es undefined, usar null
            const handleArrayField = (arr: string[] | undefined): string[] | null => {
                return arr !== undefined ? arr : null;
            };

            const coursePayload = {
                tecnologia: course.tecnologiaPrincipal,
                dificultad: course.dificultad,
                razonCurso: course.razonCurso,
                herramientasRequeridas: handleArrayField(course.requiredTools),
                conocimientosPrevios: handleArrayField(course.priorKnowledge),
                tecnologiasExcluidas: handleArrayField(course.outOfScope),
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
        
        return {
            id: courseId,
            courseId: courseId,
            ...courseData
        };
    },

    async getTemaryByCourseId(courseId: number) {
        const supabase = createClient();
        
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