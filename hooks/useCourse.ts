import { useQuery } from "react-query";
import { CourseService } from "@/lib/services/course";

export const useCourses = () => {
    return useQuery({
        queryKey: ['courses'],
        queryFn: async () => { 
            const data = await CourseService.getCourses();
            console.log("data from hook:", data);
            return data;
        }
    });
}