const llmService = process.env.LLM_SERVICE || "vercelai";

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
    },
    subtopicStarted: {
        async create(knowledgeProfile: string, subtopic: { title: string; description?: string; }) {
            const response = await fetch(`/api/${llmService}/subtopicStarted`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ knowledgeProfile, subtopic }),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Failed to create subtopic lesson' }));
                throw new Error('El error es: ' + error.error || 'Failed to create subtopic lesson');
            }
            return response.json();
        }
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