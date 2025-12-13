const llmService = process.env.LLM_SERVICE || "openai";

export const ApiServices = {
    planner: {
        async plan(topic: string, level: string, priorKnowledge: string) {
            const response = await fetch(`/api/${llmService}/planner`, {
                method: 'POST',
                body: JSON.stringify({ topic, level, priorKnowledge }),
            });
            return response.json();
        }
    }
}