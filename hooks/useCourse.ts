import { useMutation, useQuery, useQueryClient } from "react-query";
import { CourseService } from "@/lib/services/course";
import { ContextDB, CreateCourseParams, CursoCardInfo, EstadoSubtema } from "@/types/course";
import { toast } from "sonner";
import { ContextService } from "@/lib/services/context";
import { SubtopicService } from "@/lib/services/subtopic";

export const useTemary = (courseId: number, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['temary', courseId],
        queryFn: async () => {
            const data = await CourseService.getTemaryByCourseId(courseId);
            return data;
        },
        enabled: options?.enabled !== false && courseId > 0
    });
}

export const useCourses = (page: number = 1, limit: number = 9) => {
    return useQuery<{ courses: CursoCardInfo[]; total: number }>({
        queryKey: ['courses', page, limit],
        queryFn: async () => { 
            const data = await CourseService.getCourses(page, limit);
            return data;
        }
    });
}

export const useCourseInfo = (courseId: number) => {
    return useQuery({
        queryKey: ['course-info', courseId],
        queryFn: async () => { 
            const data = await CourseService.getCourseInfo(courseId);
            console.log("Course info from hook")
            return data;
        },
        enabled: courseId > 0
    });
}

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (course: CreateCourseParams) => {
            const data = await CourseService.createCourse(course);
            return data;
        },
        onSuccess: () => {
            toast.success('Curso creado exitosamente');
            queryClient.invalidateQueries(['courses']);
        },
        onError: (error: Error) => {
            toast.error((error as Error).message);
        },
    });
}

export const useContextSubtopic= (courseId: number, moduleIndex: number | null, subtopicIndex: number | null, isEnabled: boolean) => {
    return useQuery<ContextDB>({
        queryKey: ['subtopic-context', courseId, moduleIndex, subtopicIndex],
        queryFn: async () => {
            const data = await ContextService.getContextBySubtopic(courseId, (moduleIndex!), (subtopicIndex!))            
            return data;
        },
        enabled: !!courseId && moduleIndex !== null && subtopicIndex !== null && isEnabled,
        
    });
}

export const useUpdateSubtemaEstado = () => {
  return useMutation({
    mutationFn: async ({
        courseId,
        moduleOrder,
        subtopicOrder,
        newState
    }: {
        courseId: number
        moduleOrder: number
        subtopicOrder: number
        newState: EstadoSubtema
    }) =>
      SubtopicService.updateSubtopicState(courseId, moduleOrder, subtopicOrder, newState)
  })
}

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            courseId,
            titulo,
            image
        }: {
            courseId: number;
            titulo: string;
            image: number | null;
        }) => {
            const data = await CourseService.updateCourse(courseId, titulo, image);
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success('Curso actualizado exitosamente');
            queryClient.invalidateQueries(['courses']);
            queryClient.invalidateQueries(['course-info', variables.courseId]);
        },
        onError: (error: Error) => {
            toast.error((error as Error).message);
        },
    });
}