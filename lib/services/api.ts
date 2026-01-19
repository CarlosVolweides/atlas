import { toast } from "sonner";
import { ContextService } from "./context";

const llmService = process.env.NEXT_PUBLIC_LLM_SERVICE || "vercelai";

export const ApiServices = {
    planner: {
        async create(knowledgeProfile: string, razon: string) {
            const response = await fetch(`/api/${llmService}/planner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ knowledgeProfile, razon }),
            });
            if (!response.ok) {
                throw new Error('Failed to create plan');
            }
            return response.json();
        }
    },
    systemPromptCreator: {
        async create(roleText: string, focus?: string) {
            const response = await fetch(`/api/${llmService}/systemPromptCreator`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roleText, focus }),
            });
            if (!response.ok) {
                throw new Error('Failed to create system prompt');
            }
            return response.text();
        }
    },
    subtopicStarted: {
        async create(knowledgeProfile: string, subtopic: { title: string; description?: string; }, courseId: number, moduleOrder: number, subtopicOrder: number) {
            if (process.env.NEXT_PUBLIC_LLM_ACTIVE && process.env.NEXT_PUBLIC_LLM_ACTIVE === "false") {
                console.log("Creating context in development mode")
                await new Promise(resolve => setTimeout(resolve, 2500));
                return {
                    title: "Titulo de modo development",
                    content: "content de modo development",
                    estimated_read_time_min: 1,
                };
            }
            const subtopicStartedResponse = await fetch(`/api/${llmService}/subtopicStarted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ knowledgeProfile, subtopic }),
            });
            if (!subtopicStartedResponse.ok) {
                const error = await subtopicStartedResponse.json().catch(() => ({ error: 'Failed to create subtopic lesson' }));
                throw new Error('El error es: ' + error.error || 'Failed to create subtopic lesson');
            }
            console.log("subtopicStartedResponse", subtopicStartedResponse)
            const contextSubtopicData = await subtopicStartedResponse.json()
            const contextInsertData = await ContextService.postContext(courseId, moduleOrder, subtopicOrder, contextSubtopicData)
            console.log("contextInsertData", contextInsertData)

            return contextInsertData;
        },
        async get(knowledgeProfile: string, subtopic: { title: string; description?: string;}, courseId: number, moduleOrder: number, subtopicOrder: number, hasContent: boolean) {
            if(hasContent){
                return await ContextService.getContextBySubtopic(courseId, moduleOrder, subtopicOrder)
            }
            const subtopicStartedData = await ApiServices.subtopicStarted.create(knowledgeProfile, subtopic, courseId, moduleOrder, subtopicOrder )
            
            return subtopicStartedData
        },
    },
    subtopicStartedStreaming: {
        async create(knowledgeProfile: string, subtopic: { title: string; description?: string; }) {
            const response = await fetch(`/api/${llmService}/subtopicStarted(streming)`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ knowledgeProfile, subtopic }),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Failed to start subtopic streaming' }));
                throw new Error(error.error || 'Failed to start subtopic streaming');
            }
            if (!response.body) {
                throw new Error('No stream body received');
            }
            return response.body;
        }
    }
}