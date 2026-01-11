// hooks/useSubtopic.ts
import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { ApiServices } from '@/lib/services/api';
import { toast } from 'sonner';

interface SubtopicParams {
  knowledgeProfile: string;
  subtopic: { title: string; description: string; };
  courseId: number,
  moduleOrder: number,
  subtopicOrder: number,
  hasContent : boolean
}

interface SubtopicStartedResponse {
  title: string;
  content: string;
  estimated_read_time_min?: number;
}

export const useSubtopicStarted = () => {
  const queryClient = useQueryClient();
  return useMutation<SubtopicStartedResponse, Error, SubtopicParams>({
    mutationFn: async ({ knowledgeProfile, subtopic, courseId, moduleOrder, subtopicOrder, hasContent }) => {
      return await ApiServices.subtopicStarted.get(knowledgeProfile, subtopic, courseId, moduleOrder, subtopicOrder, hasContent);
    },
    onSuccess: () => {
        toast.success('Contenido de subtema creado existosamente');
        queryClient.invalidateQueries(['subtopic-content']);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar la lección');
    },
  });
};

export const useSubtopicStreaming = () => {
  const [content, setContent] = useState<string>('');
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ knowledgeProfile, subtopic }: SubtopicParams) => {
      // Resetear contenido
      setContent('');

      // Obtener el stream
      const stream = await ApiServices.subtopicStartedStreaming.create(
        knowledgeProfile,
        subtopic
      );

      // Obtener el reader
      const reader = stream.getReader();
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      // Leer chunks del stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decodificar y acumular
        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        setContent(accumulatedContent);
      }

      // Retornar el contenido final (opcional, para onSuccess)
      return accumulatedContent;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar la lección');
      setContent('');
    },
  });

  const stop = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current.releaseLock();
      readerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setContent('');
    mutation.reset();
  }, [stop, mutation]);

  return {
    content,
    isLoading: mutation.isLoading,
    error: mutation.error,
    start: mutation.mutate,
    stop,
    reset,
    isSuccess: mutation.isSuccess,
  };
};