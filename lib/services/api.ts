const llmService = process.env.LLM_SERVICE || "openai";

export const ApiServices = {
    planner: {
        async create(knowledgeProfile: string) {
            const response = await fetch(`/api/${llmService}/planner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ knowledgeProfile }),
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
            return response.json();
        }
    }
}