"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, BookOpen,
  CheckCircle2, Circle,
  Clock, XCircle,
  AlertCircle,
  ClipboardList, ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  RotateCcw,
  Menu,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ModuleTemaryI, EstadoSubtema, ordenSubtema } from '@/types/course';
import { useTemary, useContextSubtopic, useUpdateSubtemaEstado, useCourseInfo } from '@/hooks/useCourse';
import { useSubtopicStarted, useSubtopicStreaming } from '@/hooks/useSubtopic';
import { toast } from "sonner";
import { useQueryClient } from 'react-query';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MarkdownSkeleton from '@/components/MarkdownSkeleton';
import { ReturnButton, SparkleButton } from '@/components/ui/ButtonsAnimated';

type FlatSubtopic = {
  globalIndex: number
  moduleOrder: number
  subtopicOrder: number
  title: string,
  state: EstadoSubtema
}

export default function LeccionViewer() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const courseId = parseInt(params?.cursoId as string || '0');
  const { data: temaryData } = useTemary(courseId, { enabled: courseId > 0 });
  const idCurso = parseInt(params?.cursoId as string);
  const { data: infoCurso } = useCourseInfo(idCurso)

  const flatSubtopics = useMemo<FlatSubtopic[]>(() => {
    if (!temaryData) return []

    let index = 0

    return temaryData?.modules.flatMap((module: ModuleTemaryI) =>
      module.subtopics.map(sub => ({
        globalIndex: index++,
        moduleOrder: module.order,
        subtopicOrder: sub.order,
        title: sub.title,
        state: sub.state ?? 'pendiente'
      }))
    )
  }, [temaryData])
  const totalSubtopics = flatSubtopics.length;

  // Estado: índice global del subtema actual
  const [subtemaActual, setSubtemaActual] = useState(0);
  const [estadosSubtemas, setEstadosSubtemas] = useState<EstadoSubtema[]>([]);

  const ordenActivo = useMemo(() => {
    if (subtemaActual === null || !flatSubtopics[subtemaActual]) return null
    return flatSubtopics[subtemaActual]
      ? {
        mod: flatSubtopics[subtemaActual].moduleOrder,
        sub: flatSubtopics[subtemaActual].subtopicOrder
      }
      : null
  }, [subtemaActual, flatSubtopics])

  const { mutateAsync: persistEstado } = useUpdateSubtemaEstado()

  const [modulosExpandidos, setModulosExpandidos] = useState<Set<number>>(new Set([])); // Primer módulo expandido por defecto
  const [modoTutoria, setModoTutoria] = useState(false);
  const [subtemaAprobado, setSubtemaAprobado] = useState(false);
  const [modoPrueba, setModoPrueba] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Estado para controlar el sidebar en móvil

  //Estado de generacion de subtemas
  const [subtopicIsLoading, setsubtopicIsLoading] = useState(false)
  //Estado de actualizacion de subtema
  const [isAdvancing, setIsAdvancing] = useState(false)
  //Estado para contenido generado temporalmente (no persistido en BD)
  const [generatedContent, setGeneratedContent] = useState<{ title: string; content: string; estimated_read_time_min?: number } | null>(null)

  // Refs para los contenedores scrollables
  const contentScrollRef = useRef<HTMLDivElement>(null) // Contenedor del contenido del subtema
  const mainContainerRef = useRef<HTMLDivElement>(null) // Contenedor principal (móvil)

  // Hook para generar contenido de subtema (streaming)
  const streamingHook = useSubtopicStreaming()
  
  // Hook para generar contenido de subtema (no-streaming, para contenido persistido)
  const { mutateAsync: generateSubtopic, isLoading: isGenerating } = useSubtopicStarted()

  const tieneContenido = useMemo(() => {
    const estadoActual = estadosSubtemas[subtemaActual];

    if (!estadoActual) return false;
    return estadoActual !== 'vacio';
  }, [estadosSubtemas, subtemaActual]);

  const {
    data: contextSubtopic
  } = useContextSubtopic(
    courseId,
    ordenActivo?.mod ?? null,
    ordenActivo?.sub ?? null,
    tieneContenido // <--- Hara la consulta solo si no es 'vacio'
  )

  // Helper function para validar que el contenido es markdown válido (no JSON crudo)
  const isValidMarkdown = (content: string | null | undefined): boolean => {
    if (!content || content.trim().length === 0) {
      return false;
    }
    
    // Verificar que no sea JSON crudo (empieza con { o [)
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      // Intentar parsear como JSON, si es válido entonces no es markdown
      try {
        JSON.parse(trimmed);
        return false; // Es JSON válido, no markdown
      } catch {
        // No es JSON válido, podría ser markdown que empieza con {
        return true;
      }
    }
    
    // Verificar que tenga contenido mínimo de markdown (al menos un carácter)
    return trimmed.length > 0;
  };

  // Función para obtener el estado actual de un subtema
  const obtenerEstadoSubtema = (index: number): EstadoSubtema => {
    const estadoBase = estadosSubtemas[index] ?? 'pendiente';
    if (index === subtemaActual) {
      if (modoPrueba) return 'listo-para-prueba';
      if (modoTutoria || subtemaAprobado) return 'en-curso';
    }
    return estadoBase || 'pendiente';
  };

  // Función para obtener el icono y color según el estado
  const obtenerIconoEstado = (estado: EstadoSubtema | undefined) => {
    const estadoValido = estado || 'pendiente';
    switch (estadoValido) {
      case 'vacio':
        return {
          icon: <Circle className="w-5 h-5 flex-shrink-0" style={{ color: '#666666' }} />,
          color: '#666666ff',
          texto: 'Pendiente'
        };
      case 'pendiente':
        return {
          icon: <Clock className="w-5 h-5 flex-shrink-0" style={{ color: '#FFA500' }} />,
          color: '#FFA500',
          texto: 'En curso'
        };
      case 'listo-para-prueba':
        return {
          icon: <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FFFF00' }} />,
          color: '#FFFF00',
          texto: 'Listo para prueba'
        };
      case 'aprobado':
        return {
          icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF00' }} />,
          color: '#00FF00',
          texto: 'Aprobado'
        };
      case 'reprobado':
        return {
          icon: <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#FF4444' }} />,
          color: '#FF4444',
          texto: 'Reprobado'
        };
      case 'completado':
        return {
          icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#00FF00' }} />,
          color: '#00FF00',
          texto: 'Completado'
        };
      default:
        return {
          icon: <Circle className="w-5 h-5 flex-shrink-0" style={{ color: '#666666' }} />,
          color: '#666666ff',
          texto: 'Pendiente'
        };
    }
  };

  const handleMarcarCompletado = () => {//Viejo handle diseñado para pruebas
    // Primero mostrar la prueba antes de marcar como completado
    setModoPrueba(true);
  };

  const actualizarSubtema = async () => {
    if (subtemaActual === null) return

    const indexObjetivo = subtemaActual
    const sub = flatSubtopics[indexObjetivo]

    const nuevoEstado = estadosSubtemas[subtemaActual] == 'vacio' ? 'pendiente' : 'completado'

    setEstadosSubtemas(prev => {
      const copy = [...prev]
      copy[indexObjetivo] = nuevoEstado
      return copy
    })

    try {
      // Persistir en BD
      await persistEstado({
        courseId: courseId,
        moduleOrder: sub.moduleOrder,
        subtopicOrder: sub.subtopicOrder,
        newState: nuevoEstado
      })
    } catch (error) {
      // Rollback
      setEstadosSubtemas(prev => {
        const copy = [...prev]
        copy[indexObjetivo] = sub.state
        return copy
      })
      toast.error('No se pudo guardar el subtema como completado')
      throw error
    }
  }

  const handleGenerarSubtema = () => {
    if (subtemaActual === null || !flatSubtopics[subtemaActual]) return
    if (!infoCurso?.systemPrompt) return

    const estadoActual = estadosSubtemas[subtemaActual]
    const hasContent = estadoActual !== 'vacio'
    const subtopic = flatSubtopics[subtemaActual]

    if (!subtopic) {
      setsubtopicIsLoading(false)
      return
    }

    // Usar streaming para generar contenido nuevo
    setsubtopicIsLoading(true)
    streamingHook.start({
      knowledgeProfile: infoCurso.systemPrompt ?? "",
      subtopic: {
        title: subtopic.title,
        description: ''
      },
      courseId: courseId,
      moduleOrder: subtopic.moduleOrder,
      subtopicOrder: subtopic.subtopicOrder
    })
  }

  const handleRegenerarSubtema = () => {
    if (subtemaActual === null || !flatSubtopics[subtemaActual]) return
    if (!infoCurso?.systemPrompt) return

    const subtopic = flatSubtopics[subtemaActual]

    if (!subtopic) {
      setsubtopicIsLoading(false)
      return
    }

    // Limpiar contenido generado y resetear el stream
    setGeneratedContent(null)
    streamingHook.reset()

    // Usar streaming para regenerar contenido (ignora el contenido existente en DB)
    setsubtopicIsLoading(true)
    streamingHook.start({
      knowledgeProfile: infoCurso.systemPrompt ?? "",
      subtopic: {
        title: subtopic.title,
        description: ''
      },
      courseId: courseId,
      moduleOrder: subtopic.moduleOrder,
      subtopicOrder: subtopic.subtopicOrder
    })
  }

  const handleRecargarSubtema = () => {
    if (subtemaActual === null || !flatSubtopics[subtemaActual]) return

    const subtopic = flatSubtopics[subtemaActual]

    if (!subtopic) return

    // Limpiar contenido generado temporalmente
    setGeneratedContent(null)

    // Invalidar la query de React Query para forzar la recarga desde la DB
    const currentOrden = ordenActivo;
    if (currentOrden && currentOrden.mod !== null && currentOrden.sub !== null) {
      queryClient.invalidateQueries(['subtopic-context', courseId, currentOrden.mod, currentOrden.sub]);
    }
  }

  const handleSiguiente = async () => {
    if (isAdvancing) return
    if (subtemaActual < totalSubtopics - 1) {
      setIsAdvancing(true)

      try {
        await actualizarSubtema()
        setSubtemaActual(subtemaActual + 1);
        setModoTutoria(false);
        setSubtemaAprobado(false);
        setModoPrueba(false);
        setsubtopicIsLoading(false);
        
        // Scroll suave hacia arriba después de un pequeño delay para asegurar que el contenido se haya actualizado
        setTimeout(() => {
          scrollToTop();
        }, 150);
      } catch {
        toast.error('No se pudo guardar el progreso')
      } finally {
        setIsAdvancing(false)
      }

    }
  };

  // Funciones para scroll suave
  const scrollToTop = () => {
    // Intentar con el contenedor del contenido primero (más específico)
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // También intentar con el contenedor principal (móvil tiene overflow-y-auto)
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    // Fallback: usar scrollIntoView en el elemento con id (funciona mejor en algunos casos)
    setTimeout(() => {
      const contentStart = document.getElementById('content-start');
      if (contentStart) {
        contentStart.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const scrollToBottom = () => {
    // Intentar con el contenedor del contenido primero
    if (contentScrollRef.current) {
      const scrollHeight = contentScrollRef.current.scrollHeight;
      const clientHeight = contentScrollRef.current.clientHeight;
      contentScrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
    
    // También intentar con el contenedor principal (móvil tiene overflow-y-auto)
    if (mainContainerRef.current) {
      const scrollHeight = mainContainerRef.current.scrollHeight;
      const clientHeight = mainContainerRef.current.clientHeight;
      mainContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const toggleModulo = (moduleIndex: number) => {
    setModulosExpandidos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleIndex)) {
        newSet.delete(moduleIndex);
      } else {
        newSet.add(moduleIndex);
      }
      return newSet;
    });
  };


  const handleVolver = () => {
    router.push('/inicio');
  };
  const handleCambiarSubtema = (index: number) => {
    setSubtemaActual(index);
    setsubtopicIsLoading(false);
    // Cerrar el sidebar en móvil al cambiar de subtema
    setSidebarOpen(false);
  }

  // Para iniciar estados provenientes del flatSubtopics (temaryData)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!flatSubtopics.length || initializedRef.current) return

    const iniciales: EstadoSubtema[] = flatSubtopics.map(
      sub => sub.state
    )

    setEstadosSubtemas(iniciales)

    const primerPendiente =
      iniciales.findIndex(e => e !== 'completado')

    setSubtemaActual(primerPendiente !== -1 ? primerPendiente : 0)

    initializedRef.current = true
  }, [flatSubtopics])


  useEffect(() => {
    if (subtemaActual === null) return

    const sub = flatSubtopics[subtemaActual]
    if (!sub) return

    const moduleIndex = temaryData.modules.findIndex(
      (m: ModuleTemaryI) => m.order === sub.moduleOrder
    )

    if (moduleIndex !== -1) {
      setModulosExpandidos(prev => new Set([...prev, moduleIndex]))
    }
  }, [subtemaActual, flatSubtopics, temaryData])

  // useEffect para buscar contenido o generar automáticamente cuando se navega a un subtema vacío
  useEffect(() => {
    // Limpiar contenido generado al cambiar de subtema
    setGeneratedContent(null)
    // Limpiar el stream al cambiar de subtema
    streamingHook.reset()
  }, [subtemaActual])

  // useEffect para manejar cuando el streaming finaliza exitosamente
  useEffect(() => {
    if (streamingHook.isSuccess && streamingHook.data) {
      const estadoActual = estadosSubtemas[subtemaActual]
      const hasContent = estadoActual !== 'vacio'
      
      setGeneratedContent(streamingHook.data)
      setsubtopicIsLoading(false)
      
      if (!hasContent) {
        actualizarSubtema()
      }
    }
  }, [streamingHook.isSuccess, streamingHook.data, subtemaActual, estadosSubtemas])

  // useEffect para manejar errores del streaming
  useEffect(() => {
    if (streamingHook.error) {
      setsubtopicIsLoading(false)
      console.error('Error al generar subtema:', streamingHook.error)
    }
  }, [streamingHook.error])

  // useEffect para limpiar el stream al desmontar el componente
  useEffect(() => {
    return () => {
      // Cancelar el stream si el componente se desmonta
      streamingHook.stop()
    }
  }, [])


  const porcentajeCompletado = Math.round(
    (estadosSubtemas.filter(e => e === 'completado').length / totalSubtopics) * 100
  );

  return (
    <div
      className="min-h-screen max-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #001a33 0%, #004d66 50%, #00A3E2 100%)' }}
    >
      {/* Header */}
      <header
        className="w-full px-4 md:px-8 py-3 md:py-4 relative z-10"
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 163, 226, 0.2)'
        }}
      >
        {/* Versión móvil */}
        <div className="flex md:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="gap-2"
                style={{ color: '#ffffff' }}
                title="Abrir/cerrar menú"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                onClick={handleVolver}
                className="gap-2"
                style={{ color: '#ffffff' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
              >
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <h1 className="text-sm truncate" style={{ color: '#ffffff' }}>{infoCurso?.tecnologia}</h1>
            </div>
            
            {/* Estadísticas compactas en la parte superior derecha */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="px-2 py-1 rounded" style={{
                background: 'rgba(0, 163, 226, 0.2)',
                backdropFilter: 'blur(10px)',
                borderColor: '#00A3E2',
                borderWidth: '1px'
              }}>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" style={{ color: '#00A3E2' }} />
                  <span className="text-xs font-semibold" style={{ color: '#ffffff' }}>
                    {estadosSubtemas.filter(e => e === 'completado').length}/{totalSubtopics}
                  </span>
                </div>
              </div>
              <div className="px-2 py-1 rounded" style={{
                background: 'rgba(0, 163, 226, 0.2)',
                backdropFilter: 'blur(10px)',
                borderColor: '#00A3E2',
                borderWidth: '1px'
              }}>
                <span className="text-xs font-semibold" style={{ color: '#ffffff' }}>
                  {porcentajeCompletado}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Versión desktop */}
        <div className="hidden md:flex items-center justify-between">
          <ReturnButton
            onClick={handleVolver}
            className="gap-2 mb-6"
            width="w-32"
            height="h-8"
            fontSize="text-lg"
            buttonColor="#00a2e207"
            containerColor="#ffffffff"
            textColor="#ffffffff"
          >
            Volver
          </ReturnButton>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)' }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl" style={{ color: '#ffffff' }}>{infoCurso?.tecnologia}</h1>
              <div className="flex gap-2 mt-1">
                {infoCurso?.herramientasRequeridas &&
                  infoCurso?.herramientasRequeridas?.map((tech: string[], i: number) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded" style={{
                      background: 'rgba(0, 163, 226, 0.3)',
                      color: '#ffffff'
                    }}>
                      {tech}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Estadísticas */}
            <div className="flex gap-4">
              {/* Subtemas aprobados */}
              <div className="px-4 py-2 rounded-lg" style={{
                background: 'rgba(0, 163, 226, 0.2)',
                backdropFilter: 'blur(10px)',
                borderColor: '#00A3E2',
                borderWidth: '1px'
              }}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#00A3E2' }} />
                  <span className="text-xs" style={{ color: '#cccccc' }}>Subtemas aprobados</span>
                </div>
                <p className="text-xl" style={{ color: '#ffffff' }}>
                  {estadosSubtemas.filter(e => e === 'completado').length}/{totalSubtopics}
                </p>
              </div>
            </div>

            {/* Progreso */}
            <div className="w-48">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: '#ffffff' }}>Progreso</span>
                <span className="text-sm" style={{ color: '#ffffff' }}>{porcentajeCompletado}%</span>
              </div>
              <Progress
                value={porcentajeCompletado}
                className="h-2"
                style={{ background: 'rgba(255, 255, 255, 0.3)' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div 
        ref={mainContainerRef}
        className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row md:items-start gap-3 md:gap-6 p-2 md:p-8 md:pl-0 relative"
      >
        {/* Backdrop para móvil cuando el sidebar está abierto */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Lista de subtemas - Sidebar */}
        <aside
          className={`
            fixed md:relative
            top-0 md:top-auto
            left-0 md:left-auto
            bottom-0 md:bottom-auto
            w-80 max-w-[85vw]
            md:w-80 md:flex-shrink-0
            h-screen md:h-auto md:max-h-full
            flex flex-col
            z-50 md:z-0
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            shadow-2xl md:shadow-none
          `}
        >
          <Card
            style={{
              background: 'rgba(38, 36, 34, 0.6)',
              backdropFilter: 'blur(10px)',
              borderColor: '#00A3E2',
              borderWidth: '1px',
              display: 'flex',
              flexDirection: 'column'
            }}
            className="rounded-lg h-full md:h-auto md:max-h-full"
          >
            <CardContent className="p-3 md:p-4 md:pb-6 flex flex-col h-full md:h-auto md:max-h-full overflow-hidden">
              <div className="flex items-center justify-between mb-3 md:mb-4 flex-shrink-0">
                <h3 className="text-base md:text-lg" style={{ color: '#ffffff' }}>
                  Contenido del curso
                </h3>
                {/* Botón de cerrar solo en móvil */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden"
                  style={{ color: '#ffffff' }}
                  title="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-1 flex-1 min-h-0 overflow-y-auto md:max-h-[70vh] pr-1" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#00A3E2 rgba(255, 255, 255, 0.1)'
              }}>
                {temaryData?.modules.map((module: ModuleTemaryI, moduleIndex: number) => {
                  const isExpanded = modulosExpandidos.has(moduleIndex);
                  const subtopicsDelModulo = flatSubtopics.filter(
                    s => s.moduleOrder === module.order
                  )

                  return (
                    <div key={moduleIndex} className="space-y-1">
                      {/* Header del módulo */}
                      <button
                        onClick={() => toggleModulo(moduleIndex)}
                        className="w-full text-left p-2 md:p-3 rounded-lg transition-all flex items-center justify-between cursor-pointer"
                        style={{
                          background: 'rgba(0, 163, 226, 0.15)',
                          borderLeft: '3px solid #00A3E2'
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                            style={{
                              background: '#00A3E2',
                              color: '#ffffff'
                            }}
                          >
                            {module.order}
                          </div>
                          <span className="text-xs md:text-sm font-medium truncate" style={{ color: '#ffffff' }}>
                            {module.title}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#00A3E2' }} />
                        ) : (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#00A3E2' }} />
                        )}
                      </button>

                      {/* Subtemas del módulo */}
                      {isExpanded && (
                        <div className="ml-4 space-y-1 border-l-2 pl-2" style={{ borderColor: 'rgba(0, 163, 226, 0.3)' }}>
                          {subtopicsDelModulo.map(sub => {
                            const globalIndex = sub.globalIndex
                            const estado = obtenerEstadoSubtema(globalIndex)
                            const { icon } = obtenerIconoEstado(estado);
                            const isActive = subtemaActual === globalIndex;
                            const isBlocked =
                              globalIndex > 0 &&
                              estadosSubtemas[globalIndex - 1] !== 'completado'

                            return (
                              <button
                                key={globalIndex}
                                onClick={() =>
                                  isBlocked
                                    ? toast.warning("Subtema bloqueado, se requiere completar Subtemas o Modulos anteriores")
                                    : handleCambiarSubtema(globalIndex)
                                }
                                className={`w-full text-left p-2 rounded-lg transition-all ${isActive ? 'ring-2 ring-cyan-400' : ''
                                  }`}
                                style={{
                                  background: isActive
                                    ? 'rgba(0, 163, 226, 0.2)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                  color: '#ffffff'
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {icon}
                                  <span className="text-xs truncate">{sub.title}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
              {/* Botón de Tutoría Guiada ( vv ELIMINAR false para activar boton*/}
              {!modoTutoria && !modoPrueba && false && (
                <div className="mt-4 pt-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(0, 163, 226, 0.2)' }}>
                  <Button
                    onClick={() => setModoTutoria(true)}
                    className="w-full text-sm md:text-base"
                    style={{
                      background: 'linear-gradient(135deg, #00A3E2 0%, #006b9a 100%)',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Iniciar Tutoría Guiada
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Contenido del subtema actual */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden md:pl-82">
          {modoPrueba ? (
            <div className="h-full">
            </div>
          ) : !modoTutoria ? (
            <div className="h-full overflow-y-auto" ref={contentScrollRef}>
              <Card
                style={{
                  background: 'rgba(38, 36, 34, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderColor: '#00A3E2',
                  borderWidth: '1px'
                }}
                className="md:ml-0"
              >
                <CardContent className="p-3 md:p-8 md:pl-82">
                  <div className="mb-3 md:mb-6" id="content-start">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-2 md:mb-4">
                      <h2 className="text-lg md:text-2xl" style={{ color: '#ffffff' }}>
                        {flatSubtopics[subtemaActual]?.title || 'Subtema'}
                      </h2>
                      <div className="flex items-center gap-2">
                        {estadosSubtemas[subtemaActual] === 'aprobado' || estadosSubtemas[subtemaActual] === 'completado' ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full self-start" style={{ background: 'rgba(0, 163, 226, 0.2)' }}>
                            <CheckCircle2 className="w-4 h-4" style={{ color: '#00A3E2' }} />
                            <span className="text-sm" style={{ color: '#00A3E2' }}>Completado</span>
                          </div>
                        ) : null}
                        {!streamingHook.isLoading && !subtopicIsLoading && (estadosSubtemas[subtemaActual] === 'aprobado' || estadosSubtemas[subtemaActual] === 'completado' || estadosSubtemas[subtemaActual] === 'pendiente') && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={handleRecargarSubtema}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderColor: '#00A3E2',
                                color: '#ffffff'
                              }}
                              title="Recargar contenido desde la base de datos"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span className="text-xs md:text-sm">Recargar</span>
                            </Button>
                            <Button
                              onClick={handleRegenerarSubtema}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderColor: '#00A3E2',
                                color: '#ffffff'
                              }}
                              title="Regenerar contenido de este subtema (llama a la API)"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span className="text-xs md:text-sm">Regenerar</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs md:text-sm" style={{ color: '#cccccc' }}>
                      Subtema {subtemaActual + 1} de {totalSubtopics}
                    </div>
                  </div>

                  <div
                    className="prose prose-invert max-w-none mb-6 md:mb-8"
                    style={{ color: '#ffffff', lineHeight: '1.8' }}
                  >
                    <div className="mb-3 md:mb-4 text-sm md:text-base">
                      {streamingHook.isLoading || subtopicIsLoading ? (
                        <div className="flex flex-col gap-4">
                          {streamingHook.error ? (
                            // Mostrar mensaje de error en lugar del JSON crudo
                            <div className="flex flex-col items-center justify-center p-6 rounded-lg border" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' }}>
                              <AlertCircle className="w-8 h-8 mb-3" style={{ color: '#ef4444' }} />
                              <p className="text-center font-medium mb-2" style={{ color: '#ffffff' }}>
                                Error al generar la lección
                              </p>
                              <p className="text-center text-sm" style={{ color: '#cccccc' }}>
                                {streamingHook.error.message || 'Ocurrió un error inesperado'}
                              </p>
                            </div>
                          ) : streamingHook.content && isValidMarkdown(streamingHook.content) ? (
                            // Mostrar contenido en tiempo real mientras se genera (solo si es markdown válido)
                            <MarkdownRenderer content={streamingHook.content} />
                          ) : (
                            // Mostrar skeleton mientras carga o si el contenido no es válido aún
                            <MarkdownSkeleton />
                          )}
                        </div>
                      ) : generatedContent?.content ? (
                        <div className="flex flex-col gap-4">
                          <MarkdownRenderer content={generatedContent.content} />
                        </div>
                      ) : contextSubtopic?.content ? (
                        <div className="flex flex-col gap-4">
                          <MarkdownRenderer content={contextSubtopic.content} />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:gap-4 pt-4 md:pt-6 border-t" style={{ borderColor: 'rgba(0, 163, 226, 0.2)' }}>
                    {/* Botón de generar subtema */}
                    {estadosSubtemas[subtemaActual] == 'vacio' && (
                      <div>
                        
                        {subtopicIsLoading ? (
                          <p
                            className="w-full text-sm md:text-base"
                            style={{
                              color: '#ffffff',
                              textAlign: 'center'
                            }}>
                            Cargando Contenido...
                          </p>

                        ) : !isGenerating &&
                        <div className="flex justify-center w-full">
                          <SparkleButton
                            onClick={handleGenerarSubtema}
                            disabled={subtopicIsLoading}
                            className='w-full max-w-[280px] md:w-[350px] text-xs md:text-base h-10 md:h-12 rounded-xl bg-[#ffffff0d] border-1 border-solid border-[#00A3E2]'
                            hoverFrom='#00A3E2'
                            hoverTo='#0078e2ff'
                            shadowColor='#00A3E2'
                          >
                            Comenzar Lección
                          </SparkleButton>
                        </div>}
                      </div>
                    )}

                    {estadosSubtemas[subtemaActual] !== 'vacio' && (
                      <div className="flex flex-col gap-4">

                        {/* Boton de siguiente subtema */}

                        {subtemaActual < totalSubtopics - 1 && (
                          <Button
                            onClick={handleSiguiente}
                            disabled={isAdvancing}
                            variant="outline"
                            className="md:ml-auto md:w-auto w-full text-sm md:text-base"
                            style={{
                              background: 'rgba(0, 163, 226, 0.1)',
                              borderColor: '#00A3E2',
                              color: '#ffffff'
                            }}
                          >
                            {isAdvancing ? 'Guardando...' : 'Siguiente subtema'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
              
              {/* Botones flotantes de scroll solo en móvil */}
              <div className="fixed bottom-20 right-4 md:hidden flex flex-col gap-2 z-30">
                <Button
                  onClick={scrollToTop}
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-12 h-12 p-0"
                  style={{
                    background: 'rgba(0, 163, 226, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 163, 226, 0.3)',
                    color: '#ffffff'
                  }}
                  title="Ir arriba"
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <Button
                  onClick={scrollToBottom}
                  variant="ghost"
                  size="sm"
                  className="rounded-full w-12 h-12 p-0"
                  style={{
                    background: 'rgba(0, 163, 226, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 163, 226, 0.3)',
                    color: '#ffffff'
                  }}
                  title="Ir abajo"
                >
                  <ArrowDown className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-3 md:mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                <h2 className="text-xl md:text-2xl" style={{ color: '#ffffff' }}>
                  {flatSubtopics[subtemaActual]?.title || 'Subtema'}
                </h2>
                <Button
                  onClick={() => setModoTutoria(false)}
                  variant="outline"
                  size="sm"
                  className="self-start md:self-auto"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: '#00A3E2',
                    color: '#ffffff'
                  }}
                >
                  Volver a lectura
                </Button>
              </div>
              <div className="flex-1 min-h-0">
              </div>

              {/* Botón para realizar prueba después de completar la tutoría */}
              {subtemaAprobado && (
                <div className="mt-3 md:mt-4">
                  <Button
                    onClick={handleMarcarCompletado}
                    className="w-full text-sm md:text-base"
                    style={{
                      background: 'linear-gradient(135deg, #00FF00 0%, #00AA00 100%)',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Realizar Prueba del Subtema
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}