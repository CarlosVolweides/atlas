import { useMutation, useQuery, useQueryClient } from "react-query";
import { CourseService } from "@/lib/services/course";
import { CreateCourseParams } from "@/types/course";
import { toast } from "sonner";

export const useCourses = () => {
    return useQuery({
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