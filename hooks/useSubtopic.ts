// hooks/useSubtopic.ts
import { useState, useCallback, useRef, useEffect } from 'react';
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

// Helper function para normalizar saltos de línea y otros escapes en el contenido
const normalizeContentEscapes = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return content;
  }
  
  // Reemplazar escapes JSON comunes por sus caracteres reales
  return content
    .replace(/\\n/g, '\n')           // \n -> salto de línea real
    .replace(/\\r/g, '\r')           // \r -> retorno de carro
    .replace(/\\t/g, '\t')           // \t -> tabulación
    .replace(/\\"/g, '"')            // \" -> comilla doble
    .replace(/\\'/g, "'")            // \' -> comilla simple
    .replace(/\\\\/g, '\\');         // \\ -> backslash
};

// Helper function para extraer content de JSON parcial usando regex
const extractContentFromPartialJson = (jsonString: string): string | null => {
  try {
    // Intentar parsear el JSON completo primero
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object' && typeof parsed.content === 'string') {
      // Normalizar escapes en el contenido parseado
      return normalizeContentEscapes(parsed.content);
    }
  } catch {
    // Si falla, intentar extraer el campo content usando regex
    // Buscar el patrón "content": "..." incluso si el JSON está incompleto
    const contentMatch = jsonString.match(/"content"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
    if (contentMatch && contentMatch[1]) {
      // Decodificar escapes JSON
      try {
        const decoded = JSON.parse(`"${contentMatch[1]}"`);
        return normalizeContentEscapes(decoded);
      } catch {
        return normalizeContentEscapes(contentMatch[1]);
      }
    }
    
    // Alternativa: buscar content con regex más flexible para JSON incompleto
    const flexibleMatch = jsonString.match(/"content"\s*:\s*"((?:[^"\\]|\\.|")*)/);
    if (flexibleMatch && flexibleMatch[1]) {
      // Normalizar escapes usando la función helper
      return normalizeContentEscapes(flexibleMatch[1]);
    }
  }
  return null;
};

export const useSubtopicStreaming = () => {
  const [rawContent, setRawContent] = useState<string>(''); // Contenido completo del stream
  const [displayedContent, setDisplayedContent] = useState<string>(''); // Contenido mostrado (suavizado)
  const [isStreaming, setIsStreaming] = useState<boolean>(false); // Estado para controlar el streaming
  const [data, setData] = useState<SubtopicStartedResponse | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const displayedIndexRef = useRef<number>(0);
  const rawContentRef = useRef<string>(''); // Ref para acceder al contenido más reciente en el intervalo

  // Actualizar la ref cuando cambia rawContent
  useEffect(() => {
    rawContentRef.current = rawContent;
  }, [rawContent]);

  // Efecto para suavizar la aparición del texto (typewriter effect)
  useEffect(() => {
    // Si no hay contenido, limpiar y salir
    if (!rawContent) {
      setDisplayedContent('');
      displayedIndexRef.current = 0;
      rawContentRef.current = '';
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
      return;
    }

    // Si no está streaming, mostrar todo el contenido de inmediato
    if (!isStreaming) {
      setDisplayedContent(rawContent);
      displayedIndexRef.current = rawContent.length;
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
      return;
    }

    // Si ya hay un intervalo corriendo, solo actualizar el contenido disponible
    // El intervalo continuará mostrando progresivamente
    if (typewriterIntervalRef.current) {
      return;
    }

    // Calcular cuántos caracteres mostrar por frame
    // Velocidad ajustable: más caracteres = más rápido, menos = más suave
    const charsPerFrame = 8; // Mostrar 3 caracteres a la vez para suavidad
    const frameDelay = 10; // ~60fps (16ms por frame)

    typewriterIntervalRef.current = setInterval(() => {
      const currentIndex = displayedIndexRef.current;
      const currentRawContent = rawContentRef.current; // Usar ref para obtener el valor más reciente
      
      // Si ya mostramos todo el contenido disponible, esperar más contenido
      if (currentIndex >= currentRawContent.length) {
        // Si el streaming terminó, mostrar todo de inmediato y limpiar
        if (!isStreaming) {
          setDisplayedContent(currentRawContent);
          displayedIndexRef.current = currentRawContent.length;
          if (typewriterIntervalRef.current) {
            clearInterval(typewriterIntervalRef.current);
            typewriterIntervalRef.current = null;
          }
        }
        return;
      }

      // Calcular nuevo índice (mostrar más caracteres)
      const newIndex = Math.min(
        currentIndex + charsPerFrame,
        currentRawContent.length
      );
      
      displayedIndexRef.current = newIndex;
      setDisplayedContent(currentRawContent.substring(0, newIndex));
    }, frameDelay);

    // Cleanup
    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
        typewriterIntervalRef.current = null;
      }
    };
  }, [rawContent, isStreaming]);

  const mutation = useMutation<SubtopicStartedResponse, Error, Omit<SubtopicParams, 'hasContent'>>({
    mutationFn: async ({ knowledgeProfile, subtopic, courseId, moduleOrder, subtopicOrder }) => {
      // Resetear contenido y datos
      setRawContent('');
      setDisplayedContent('');
      displayedIndexRef.current = 0;
      setData(null);
      setIsStreaming(true);

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
          // Normalizar escapes y actualizar rawContent (el efecto typewriter se encargará de mostrarlo)
          const normalizedContent = normalizeContentEscapes(extractedContent);
          lastValidContent = normalizedContent;
          setRawContent(normalizedContent);
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
        
        // Normalizar escapes en el contenido (convertir \n a saltos de línea reales)
        parsedData.content = normalizeContentEscapes(parsedData.content);
        
        // Actualizar rawContent con el contenido final parseado y normalizado
        // El efecto typewriter mostrará el resto del contenido suavemente
        setRawContent(parsedData.content);
        setIsStreaming(false); // Marcar que el streaming terminó
        
      } catch (parseError) {
        // Si falla el parsing, intentar extraer content con el helper
        const extractedContent = extractContentFromPartialJson(accumulatedJson);
        if (extractedContent && extractedContent.trim().length > 0) {
          // Normalizar escapes y usar el contenido extraído
          const normalizedContent = normalizeContentEscapes(extractedContent);
          parsedData = {
            title: subtopic.title,
            content: normalizedContent,
            estimated_read_time_min: undefined
          };
          setRawContent(normalizedContent);
          setIsStreaming(false);
        } else if (lastValidContent.trim().length > 0) {
          // Si no se puede extraer pero tenemos contenido válido previo, usarlo
          // (ya está normalizado porque se normalizó cuando se estableció)
          console.warn('Error al parsear JSON del stream, usando último contenido válido extraído:', parseError);
          parsedData = {
            title: subtopic.title,
            content: lastValidContent,
            estimated_read_time_min: undefined
          };
          setRawContent(lastValidContent);
          setIsStreaming(false);
        } else {
          // Si no hay contenido válido, no establecer JSON crudo
          console.warn('Error al parsear JSON del stream, no se pudo extraer contenido válido:', parseError);
          // El componente mostrará un mensaje de error si es necesario
          parsedData = {
            title: subtopic.title,
            content: '',
            estimated_read_time_min: undefined
          };
          setRawContent('');
          setIsStreaming(false);
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
      setRawContent('');
      setDisplayedContent('');
      displayedIndexRef.current = 0;
      setData(null);
      setIsStreaming(false);
    },
  });

  const stop = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current.releaseLock();
      readerRef.current = null;
    }
    setIsStreaming(false);
    // Limpiar el intervalo del typewriter
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setRawContent('');
    setDisplayedContent('');
    displayedIndexRef.current = 0;
    setData(null);
    setIsStreaming(false);
    mutation.reset();
  }, [stop, mutation]);

  return {
    content: displayedContent,  // Contenido suavizado que se muestra progresivamente
    data,                       // Objeto completo parseado al finalizar
    isLoading: mutation.isLoading,
    error: mutation.error,
    start: mutation.mutate,
    stop,
    reset,
    isSuccess: mutation.isSuccess,
  };
};