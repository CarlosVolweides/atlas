// hooks/useSubtopic.ts
import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { ApiServices } from '@/lib/services/api';
import { ContextService } from '@/lib/services/context';
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
        queryClient.invalidateQueries(['subtopic-content']);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar la lección');
    },
  });
};

// Helper function para extraer content de JSON parcial usando regex
const extractContentFromPartialJson = (jsonString: string): string | null => {
  try {
    // Intentar parsear el JSON completo primero
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object' && typeof parsed.content === 'string') {
      return parsed.content;
    }
  } catch {
    // Si falla, intentar extraer el campo content usando regex
    // Buscar el patrón "content": "..." incluso si el JSON está incompleto
    const contentMatch = jsonString.match(/"content"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
    if (contentMatch && contentMatch[1]) {
      // Decodificar escapes JSON
      try {
        return JSON.parse(`"${contentMatch[1]}"`);
      } catch {
        return contentMatch[1];
      }
    }
    
    // Alternativa: buscar content con regex más flexible para JSON incompleto
    const flexibleMatch = jsonString.match(/"content"\s*:\s*"((?:[^"\\]|\\.|")*)/);
    if (flexibleMatch && flexibleMatch[1]) {
      // Intentar decodificar, removiendo escapes
      return flexibleMatch[1]
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
  }
  return null;
};

export const useSubtopicStreaming = () => {
  const [content, setContent] = useState<string>('');
  const [data, setData] = useState<SubtopicStartedResponse | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const mutation = useMutation<SubtopicStartedResponse, Error, Omit<SubtopicParams, 'hasContent'>>({
    mutationFn: async ({ knowledgeProfile, subtopic, courseId, moduleOrder, subtopicOrder }) => {
      // Resetear contenido y datos
      setContent('');
      setData(null);

      // Obtener el stream
      const stream = await ApiServices.subtopicStartedStreaming.create(
        knowledgeProfile,
        subtopic,
        courseId,
        moduleOrder,
        subtopicOrder
      );

      // Obtener el reader
      const reader = stream.getReader();
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let accumulatedJson = '';
      let lastValidContent = ''; // Rastrear el último contenido válido extraído

      // Leer chunks del stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decodificar y acumular
        const chunk = decoder.decode(value, { stream: true });
        accumulatedJson += chunk;
        
        // Intentar extraer solo el campo content del JSON parcial
        const extractedContent = extractContentFromPartialJson(accumulatedJson);
        if (extractedContent !== null && extractedContent.trim().length > 0) {
          // Actualizar content con solo el markdown extraído
          lastValidContent = extractedContent;
          setContent(extractedContent);
        }
        // Si no se puede extraer, no actualizar content (mantener el último contenido válido)
        // Esto evita mostrar JSON crudo durante el streaming
      }

      // Al finalizar, intentar parsear el JSON completo para data
      let parsedData: SubtopicStartedResponse | null = null;
      
      try {
        // Intentar parsear el JSON completo
        const trimmedJson = accumulatedJson.trim();
        parsedData = JSON.parse(trimmedJson);
        
        // Validar que tenga la estructura esperada
        if (!parsedData || typeof parsedData !== 'object') {
          throw new Error('JSON parseado no es un objeto válido');
        }
        
        if (!parsedData.content || typeof parsedData.content !== 'string') {
          throw new Error('JSON no contiene campo content válido');
        }
        
        // Asegurar que title existe
        if (!parsedData.title || typeof parsedData.title !== 'string') {
          parsedData.title = subtopic.title;
        }
        
        // Actualizar content con el contenido final parseado
        setContent(parsedData.content);
        
      } catch (parseError) {
        // Si falla el parsing, intentar extraer content con el helper
        const extractedContent = extractContentFromPartialJson(accumulatedJson);
        if (extractedContent && extractedContent.trim().length > 0) {
          // Si se puede extraer contenido válido, usarlo
          parsedData = {
            title: subtopic.title,
            content: extractedContent,
            estimated_read_time_min: undefined
          };
          setContent(extractedContent);
        } else if (lastValidContent.trim().length > 0) {
          // Si no se puede extraer pero tenemos contenido válido previo, usarlo
          console.warn('Error al parsear JSON del stream, usando último contenido válido extraído:', parseError);
          parsedData = {
            title: subtopic.title,
            content: lastValidContent,
            estimated_read_time_min: undefined
          };
          // No actualizar content aquí, ya está establecido con el último válido
        } else {
          // Si no hay contenido válido, no establecer JSON crudo
          console.warn('Error al parsear JSON del stream, no se pudo extraer contenido válido:', parseError);
          // El componente mostrará un mensaje de error si es necesario
          parsedData = {
            title: subtopic.title,
            content: '',
            estimated_read_time_min: undefined
          };
          setContent('');
        }
      }

      // Guardar el contenido en la base de datos después de parsear exitosamente
      if (parsedData && parsedData.content && parsedData.content.trim().length > 0) {
        try {
          await ContextService.postContext(
            courseId,
            moduleOrder,
            subtopicOrder,
            {
              title: parsedData.title,
              content: parsedData.content,
              estimated_read_time_min: parsedData.estimated_read_time_min
            }
          );
          console.log('Contenido del subtopic guardado exitosamente');
        } catch (saveError) {
          console.error('Error al guardar el contenido del subtopic:', saveError);
          // No lanzar el error para no romper el flujo del streaming
          toast.error('El contenido se generó pero no se pudo guardar. Intenta nuevamente.');
        }
      }

      setData(parsedData);
      return parsedData;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar la lección');
      setContent('');
      setData(null);
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
    setData(null);
    mutation.reset();
  }, [stop, mutation]);

  return {
    content,           // Contenido en tiempo real mientras se genera
    data,              // Objeto completo parseado al finalizar
    isLoading: mutation.isLoading,
    error: mutation.error,
    start: mutation.mutate,
    stop,
    reset,
    isSuccess: mutation.isSuccess,
  };
};