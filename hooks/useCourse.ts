import { useMutation, useQuery, useQueryClient } from "react-query";
import { CourseService } from "@/lib/services/course";
import { ContextDB, CreateCourseParams, CursoCardInfo } from "@/types/course";
import { toast } from "sonner";
import { ContextService } from "@/lib/services/context";

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

export const useCourses = () => {
    return useQuery<CursoCardInfo[]>({
        queryKey: ['courses'],
        queryFn: async () => { 
            const data = await CourseService.getCourses();
            return data;
        }
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

export const useContextSubtopic= (courseId: number, moduleIndex: number | null, subtopicIndex: number | null) => {
    return useQuery<ContextDB>({
        queryKey: ['subtopic-context', courseId, moduleIndex, subtopicIndex],
        queryFn: async () => {
            const data = await ContextService.getContextBySubtopic(courseId, (moduleIndex!), (subtopicIndex!))
            console.log("Data from hook useContextSubtopic", data)
            return data;
        },
        enabled: !!courseId && moduleIndex !== null && subtopicIndex !== null,
        
    });
}